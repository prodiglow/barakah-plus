import { Request, Response } from 'express';
import {
  initiateAlfalahPayment,
  inquireOrderStatus,
  isTrustedIPNUrl,
  orderRefFromIPNUrl,
  interpretOrderStatus,
  ipnBelongsToMerchant,
} from '../services/alfalah.service';
import { validateAlfalahConfig } from '../config/alfalah.config';
import { AlfalahTransactionType, InitiateAlfalahPaymentRequest } from '../types/alfalah.types';
import { PaymentTransaction } from '../models/PaymentTransaction';

/**
 * Health Check
 * GET /api/alfalah/health
 */
export async function healthCheck(req: Request, res: Response): Promise<void> {
  const configValidation = validateAlfalahConfig();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    configValid: configValidation.valid,
    configErrors: configValidation.errors,
  });
}

/**
 * Initiate Payment (handshake + SSO payload)
 * POST /api/alfalah/initiate
 */
export async function initiatePayment(req: Request, res: Response): Promise<void> {
  try {
    const body: InitiateAlfalahPaymentRequest = req.body;

    if (!body.amount || body.amount <= 0) {
      res.status(400).json({ success: false, error: 'Valid amount is required' });
      return;
    }

    const configValidation = validateAlfalahConfig();
    if (!configValidation.valid) {
      res.status(500).json({
        success: false,
        error: 'Alfalah gateway is not configured',
        details: configValidation.errors,
      });
      return;
    }

    const result = await initiateAlfalahPayment(
      body.amount,
      body.transactionTypeId || AlfalahTransactionType.CREDIT_DEBIT_CARD,
      body.orderRef
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    console.error('Error initiating Alfalah payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}

/**
 * APG appends the result to the ReturnURL as PATH SEGMENTS, e.g.
 *   /api/alfalah/return/TS=P/RC=00/RD=/O=AF123
 * but may also use regular query params. Merge both.
 */
function parseReturnParams(req: Request): Record<string, string> {
  const params: Record<string, string> = {};

  const safeDecode = (s: string): string => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s; // tolerate stray '%' in free-text segments (e.g. RD=Discount 5%)
    }
  };

  for (const segment of req.originalUrl.split(/[/?&]/)) {
    const eq = segment.indexOf('=');
    if (eq > 0) {
      const key = safeDecode(segment.slice(0, eq));
      const value = safeDecode(segment.slice(eq + 1));
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) && !(key in params)) {
        params[key] = value;
      }
    }
  }

  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === 'string') params[key] = value;
  }

  return params;
}

/**
 * Handle APG Return redirect (customer lands here after paying)
 * GET|POST /api/alfalah/return[/TS=P/RC=00/RD=/O=ref]
 *
 * Never trusts the redirect params alone — verifies via the IPN
 * status inquiry, then forwards the customer to the frontend result page.
 */
export async function handleReturn(req: Request, res: Response): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL || 'https://barakaplus.com';
  const redirectUrl = new URL('/payment/alfalah-callback', frontendUrl);

  try {
    console.log('📥 Alfalah return received:', req.originalUrl);

    const params = parseReturnParams(req);
    const orderRef = params.O || params.o || params.TransactionReferenceNumber || '';
    const rc = params.RC || '';
    const ts = params.TS || '';

    redirectUrl.searchParams.set('orderRef', orderRef);
    if (rc) redirectUrl.searchParams.set('rc', rc);

    if (!orderRef) {
      redirectUrl.searchParams.set('status', 'unknown');
      redirectUrl.searchParams.set('verified', 'false');
      redirectUrl.searchParams.set('message', 'No order reference returned by gateway');
      res.redirect(302, redirectUrl.toString());
      return;
    }

    // Authoritative verification
    try {
      const ipn = await inquireOrderStatus(orderRef);
      const outcome = interpretOrderStatus(ipn);

      if (outcome === 'paid') {
        redirectUrl.searchParams.set('status', 'paid');
        redirectUrl.searchParams.set('verified', 'true');
      } else if (outcome === 'failed') {
        redirectUrl.searchParams.set('status', 'failed');
        redirectUrl.searchParams.set('verified', 'true');
      } else {
        // 'pending' (in-flight) or 'error' (e.g. Order Not Found) — do NOT
        // declare a failure; the transaction may still settle. The IPN
        // listener / a later status re-check is the source of truth.
        redirectUrl.searchParams.set('status', 'pending');
        redirectUrl.searchParams.set('verified', 'false');
      }
      redirectUrl.searchParams.set('amount', ipn.TransactionAmount || '');
      redirectUrl.searchParams.set('transactionId', ipn.TransactionId || '');
      redirectUrl.searchParams.set('message', ipn.Description || ipn.TransactionStatus || '');
    } catch (ipnError: any) {
      console.error('Alfalah IPN verification failed, falling back to redirect params:', ipnError);
      // Could not reach the gateway — treat as provisional, never as a hard fail.
      const looksPaid = ts === 'P' && rc === '00';
      redirectUrl.searchParams.set('status', looksPaid ? 'paid' : 'pending');
      redirectUrl.searchParams.set('verified', 'false');
      redirectUrl.searchParams.set('message', 'Could not verify with gateway — status is provisional');
    }

    console.log('🔄 Redirecting to:', redirectUrl.toString());
    res.redirect(302, redirectUrl.toString());
  } catch (error: any) {
    console.error('Error processing Alfalah return:', error);
    redirectUrl.searchParams.set('status', 'unknown');
    redirectUrl.searchParams.set('verified', 'false');
    redirectUrl.searchParams.set('message', error.message || 'Return processing failed');
    res.redirect(302, redirectUrl.toString());
  }
}

/**
 * IPN Listener webhook — APG calls this server-to-server:
 *   POST|GET /api/alfalah/listener?url=https://sandbox.bankalfalah.com/HS/api/IPN/OrderStatus/...
 * We fetch the provided status URL (host-validated) and update any matching
 * PaymentTransaction. Fires even if the customer closed the browser.
 */
export async function handleListener(req: Request, res: Response): Promise<void> {
  try {
    const statusUrl = (req.query.url as string) || (req.body && req.body.url);
    console.log('📥 Alfalah IPN listener called:', statusUrl);

    if (!statusUrl || !isTrustedIPNUrl(statusUrl)) {
      res.status(400).json({ success: false, error: 'Missing or untrusted status URL' });
      return;
    }

    // Trust only the order reference from the callback URL — re-inquire through
    // our own config-built URL so a foreign merchant/store can't be substituted.
    const orderRef = orderRefFromIPNUrl(statusUrl);
    if (!orderRef) {
      res.status(400).json({ success: false, error: 'Could not extract order reference from URL' });
      return;
    }

    const ipn = await inquireOrderStatus(orderRef);

    // Reject a status that does not belong to our merchant/store.
    if (!ipnBelongsToMerchant(ipn)) {
      console.warn(`⛔ Alfalah IPN: merchant/store mismatch for ${orderRef} — ignoring`);
      res.status(200).json({ success: true, ignored: true, reason: 'merchant mismatch' });
      return;
    }

    const outcome = interpretOrderStatus(ipn);

    // Only act on a settled result; leave the record untouched while pending
    // or on an inquiry error so we never overwrite a good status with a stale one.
    if (outcome === 'paid' || outcome === 'failed') {
      const dbStatus = outcome === 'paid' ? 'Success' : 'Failed';
      const updated = await PaymentTransaction.findOneAndUpdate(
        { pp_TxnRefNo: orderRef, paymentMethod: 'alfalah' },
        {
          status: dbStatus,
          pp_ResponseCode: ipn.ResponseCode || '',
          pp_ResponseMessage: `${ipn.TransactionStatus || ''} (via IPN listener)`,
          pp_Amount: ipn.TransactionAmount || '',
          pp_AuthCode: ipn.TransactionId || '',
        },
        { new: true }
      );
      console.log(
        updated
          ? `✅ Alfalah IPN: transaction ${orderRef} marked ${dbStatus}`
          : `ℹ️ Alfalah IPN: no stored transaction for ${orderRef} (customer may not have returned yet)`
      );
    } else {
      console.log(`ℹ️ Alfalah IPN: ${orderRef} still ${outcome} — no update`);
    }

    res.json({ success: true, orderRef, transactionStatus: ipn.TransactionStatus, outcome });
  } catch (error: any) {
    console.error('Error processing Alfalah IPN listener:', error);
    res.status(500).json({ success: false, error: error.message || 'Listener processing failed' });
  }
}

/**
 * Manual status inquiry
 * GET /api/alfalah/status/:orderRef
 */
export async function getOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const { orderRef } = req.params;

    if (!orderRef) {
      res.status(400).json({ success: false, error: 'Order reference is required' });
      return;
    }

    const ipn = await inquireOrderStatus(String(orderRef));
    const outcome = interpretOrderStatus(ipn);
    // Return a minimal, non-PII subset (omit AccountNumber / MobileNumber).
    res.json({
      success: true,
      paid: outcome === 'paid',
      status: outcome,
      data: {
        orderRef: ipn.TransactionReferenceNumber || orderRef,
        transactionStatus: ipn.TransactionStatus || null,
        transactionId: ipn.TransactionId || null,
        amount: ipn.TransactionAmount || null,
        transactionDateTime: ipn.TransactionDateTime || null,
      },
    });
  } catch (error: any) {
    console.error('Error inquiring Alfalah order status:', error);
    res.status(500).json({ success: false, error: error.message || 'Status inquiry failed' });
  }
}
