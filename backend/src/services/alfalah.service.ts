import {
  getAlfalahConfig,
  getHandshakeUrl,
  getSSOUrl,
  getIPNUrl,
} from '../config/alfalah.config';
import { generateRequestHash, buildMapString } from '../utils/alfalah.hash.utils';
import {
  AlfalahOrderStatus,
  AlfalahTransactionType,
  HandshakeResponse,
  SSOFormPayload,
} from '../types/alfalah.types';

/**
 * Generate a unique merchant transaction reference for APG.
 * Alphanumeric, e.g. AF17529012345678
 */
export function generateOrderRef(): string {
  const random = Math.floor(Math.random() * 90 + 10); // 2 digits
  return `AF${Date.now()}${random}`;
}

/**
 * Step 1 — Handshake (server-to-server).
 * HS_IsRedirectionRequest=0 makes APG return JSON with an AuthToken.
 * Field order verified live against the sandbox (2026-07-12).
 */
export async function initiateHandshake(orderRef: string): Promise<HandshakeResponse> {
  const config = getAlfalahConfig();

  const fields: Record<string, string> = {
    HS_IsRedirectionRequest: '0',
    HS_ChannelId: config.channelId,
    HS_ReturnURL: config.returnUrl,
    HS_MerchantId: config.merchantId,
    HS_StoreId: config.storeId,
    HS_MerchantHash: config.merchantHash,
    HS_MerchantUsername: config.merchantUsername,
    HS_MerchantPassword: config.merchantPassword,
    HS_TransactionReferenceNumber: orderRef,
  };

  const requestHash = generateRequestHash(buildMapString(fields));

  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) {
    body.append(key, value);
  }
  body.append('HS_RequestHash', requestHash);

  const response = await fetch(getHandshakeUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const text = await response.text();
  try {
    return JSON.parse(text) as HandshakeResponse;
  } catch {
    throw new Error(`APG handshake returned non-JSON response (HTTP ${response.status})`);
  }
}

/**
 * Step 2 — Build the SSO page-redirection form.
 * The RequestHash is computed over the fields with RequestHash itself empty,
 * matching Bank Alfalah's own sample code, then injected into the form.
 */
export function buildSSOFormPayload(
  authToken: string,
  orderRef: string,
  amount: number,
  transactionTypeId: string
): SSOFormPayload {
  const config = getAlfalahConfig();

  const fields: Record<string, string> = {
    AuthToken: authToken,
    RequestHash: '',
    ChannelId: config.channelId,
    Currency: 'PKR',
    IsBIN: '0',
    ReturnURL: config.returnUrl,
    MerchantId: config.merchantId,
    StoreId: config.storeId,
    MerchantHash: config.merchantHash,
    MerchantUsername: config.merchantUsername,
    MerchantPassword: config.merchantPassword,
    TransactionTypeId: transactionTypeId,
    TransactionReferenceNumber: orderRef,
    TransactionAmount: String(Math.round(amount)), // APG expects whole rupees
  };

  fields.RequestHash = generateRequestHash(buildMapString(fields));

  return { url: getSSOUrl(), fields };
}

/**
 * Full initiation: handshake then SSO payload.
 * Returns the same shape as the JazzCash card flow ({ postUrl, formFields, txnRefNo })
 * so the frontend can reuse its hidden-form redirect logic.
 */
export async function initiateAlfalahPayment(
  amount: number,
  transactionTypeId: string = AlfalahTransactionType.CREDIT_DEBIT_CARD,
  orderRef?: string
): Promise<any> {
  const ref = orderRef || generateOrderRef();

  const handshake = await initiateHandshake(ref);

  if (handshake.success !== 'true' || !handshake.AuthToken) {
    return {
      success: false,
      error: handshake.ErrorMessage || 'APG handshake failed',
    };
  }

  const sso = buildSSOFormPayload(handshake.AuthToken, ref, amount, transactionTypeId);

  return {
    success: true,
    postUrl: sso.url,
    formFields: sso.fields,
    txnRefNo: ref,
    message: 'Payment Initiated',
  };
}

/**
 * IPN status inquiry — the authoritative source of truth for a transaction.
 * GET /HS/api/IPN/OrderStatus/{merchantId}/{storeId}/{orderRef}
 */
export async function inquireOrderStatus(orderRef: string): Promise<AlfalahOrderStatus> {
  const response = await fetch(getIPNUrl(orderRef), { method: 'GET' });
  const text = await response.text();

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`APG IPN returned non-JSON response (HTTP ${response.status})`);
  }
  // The IPN endpoint sometimes double-encodes its JSON payload
  if (typeof parsed === 'string') {
    parsed = JSON.parse(parsed);
  }
  return parsed as AlfalahOrderStatus;
}

/** APG hosts we allow the listener to call back into (SSRF guard) */
export function isTrustedIPNUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' &&
      ['sandbox.bankalfalah.com', 'payments.bankalfalah.com'].includes(parsed.hostname) &&
      parsed.pathname.startsWith('/HS/api/IPN/OrderStatus/')
    );
  } catch {
    return false;
  }
}

/**
 * Extract the order reference (last path segment) from an APG IPN status URL.
 * We re-derive the ref rather than trusting the caller's full URL so that our
 * own inquiry rebuilds the merchant/store/environment from config.
 */
export function orderRefFromIPNUrl(url: string): string | null {
  try {
    const segments = new URL(url).pathname.split('/').filter(Boolean);
    const ref = segments[segments.length - 1];
    return ref ? decodeURIComponent(ref) : null;
  } catch {
    return null;
  }
}

export type IPNOutcome = 'paid' | 'failed' | 'pending' | 'error';

/**
 * Interpret an IPN OrderStatus payload.
 *  - ResponseCode other than "00" is an inquiry-level error (e.g. "11" Order Not Found),
 *    NOT a payment decline — return 'error' so callers don't wrongly fail the order.
 *  - Only "Paid" is a confirmed success; recognised terminal states are 'failed';
 *    anything else (Initiated/InProgress/…) is 'pending'.
 */
export function interpretOrderStatus(ipn: AlfalahOrderStatus | null | undefined): IPNOutcome {
  if (!ipn) return 'error';
  const rc = String(ipn.ResponseCode ?? '').trim();
  const status = String(ipn.TransactionStatus ?? '').trim().toLowerCase();
  if (rc && rc !== '00') return 'error';
  if (!status) return 'error';
  if (status === 'paid') return 'paid';
  if (['failed', 'unpaid', 'declined', 'cancelled', 'canceled', 'expired', 'reversed'].includes(status)) {
    return 'failed';
  }
  return 'pending';
}

/**
 * Confirm an IPN payload actually belongs to our merchant/store.
 * Guards the listener against a foreign-merchant status being trusted.
 */
export function ipnBelongsToMerchant(ipn: AlfalahOrderStatus): boolean {
  const config = getAlfalahConfig();
  const midOk = !ipn.MerchantId || String(ipn.MerchantId) === String(config.merchantId);
  const sidOk = !ipn.StoreId || String(ipn.StoreId) === String(config.storeId);
  return midOk && sidOk;
}
