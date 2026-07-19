import { Request, Response } from 'express';
import { InitiatePaymentRequest, JazzCashCallbackData } from '../types/jazzcash.types';
import {
  initiateMWalletTransaction,
  initiateCardTransaction,
  processPaymentCallback,
  inquireTransactionStatus
} from '../services/jazzcash.service';
import { validateConfig } from '../config/jazzcash.config';

/**
 * Health Check
 */
export async function healthCheck(req: Request, res: Response): Promise<void> {
  const configValidation = validateConfig();
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    configValid: configValidation.valid,
    configErrors: configValidation.errors
  });
}

/**
 * Initiate MWallet Payment
 * POST /api/payment/mwallet
 */
export async function initiateMWalletPayment(req: Request, res: Response): Promise<void> {
  try {
    const body: InitiatePaymentRequest = req.body;

    // Validate required fields
    if (!body.amount || body.amount <= 0) {
      res.status(400).json({ success: false, error: 'Valid amount is required' });
      return;
    }
    if (!body.customerName) {
      res.status(400).json({ success: false, error: 'Customer name is required' });
      return;
    }
    if (!body.customerEmail) {
      res.status(400).json({ success: false, error: 'Customer email is required' });
      return;
    }

    const result = await initiateMWalletTransaction(
      body.amount,
      {
        name: body.customerName,
        phone: body.customerPhone || '',
        cnic: body.customerCnic || '',
        email: body.customerEmail
      },
      body.description || 'Payment',
      body.billReference || 'billref'
    );
      console.log(result);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error: any) {
    console.error('Error initiating MWallet payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * Initiate Card Payment
 * POST /api/payment/card
 */
export async function initiateCardPayment(req: Request, res: Response): Promise<void> {
  try {
    console.log('Received Card Payment Request:', req.body);
    const body: InitiatePaymentRequest = req.body;

    // Validate required fields
    if (!body.amount || body.amount <= 0) {
      res.status(400).json({ success: false, error: 'Valid amount is required' });
      return;
    }
    // We don't need customer name/email strictly for the redirect, but good to have
    
    const result = await initiateCardTransaction(
      body.amount,
      {
        name: body.customerName || '',
        phone: body.customerPhone || '',
        email: body.customerEmail || '',
        cnic: body.customerCnic || ''
      },
      body.description || 'Payment',
      body.billReference || 'billref'
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error: any) {
    console.error('Error initiating card payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * Handle JazzCash Callback
 * POST /api/payment/callback
 * 
 * JazzCash sends POST data as form-urlencoded or JSON
 */
export async function handleCallback(req: Request, res: Response): Promise<void> {
  try {
    console.log('📥 JazzCash callback received');
    console.log('Method:', req.method);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body:', req.body);
    console.log('Query:', req.query);

    // Extract callback data from body or query
    let callbackData: JazzCashCallbackData = {};
    
    if (req.method === 'POST' && req.body) {
      callbackData = req.body;
    } else if (req.query) {
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string') {
          callbackData[key] = value;
        }
      }
    }

    // Process the callback
    const result = processPaymentCallback(callbackData);

    // Get frontend URL for redirect
    const frontendUrl = process.env.FRONTEND_URL || 'https://barakaplus.com';

    let redirectPath = '/payment/callback1';
    if (callbackData.pp_BillReference && callbackData.pp_BillReference.startsWith('CART')) {
        redirectPath = '/user/cart';
    }

    // Build redirect URL with parameters
    const redirectUrl = new URL(redirectPath, frontendUrl);
    
    if (callbackData.pp_ResponseCode) {
      redirectUrl.searchParams.set('pp_ResponseCode', callbackData.pp_ResponseCode);
    }
    if (callbackData.pp_ResponseMessage) {
      redirectUrl.searchParams.set('pp_ResponseMessage', callbackData.pp_ResponseMessage);
    }
    if (callbackData.pp_TxnRefNo) {
      redirectUrl.searchParams.set('pp_TxnRefNo', callbackData.pp_TxnRefNo);
    }
    if (callbackData.pp_Amount) {
      redirectUrl.searchParams.set('pp_Amount', callbackData.pp_Amount);
    }

    console.log('🔄 Redirecting to:', redirectUrl.toString());

    // Redirect to frontend
    res.redirect(302, redirectUrl.toString());

  } catch (error: any) {
    console.error('Error processing callback:', error);
    
    const frontendUrl = process.env.FRONTEND_URL || 'https://barakaplus.com';
    const errorUrl = new URL('/payment/callback1', frontendUrl);
    errorUrl.searchParams.set('error', 'processing_failed');
    errorUrl.searchParams.set('message', error.message || 'Callback processing failed');
    
    res.redirect(302, errorUrl.toString());
  }
}

/**
 * Get Transaction Status
 * GET /api/payment/status/:txnRefNo
 */
export async function getTransactionStatus(req: Request, res: Response): Promise<void> {
  try {
    const { txnRefNo } = req.params;

    if (!txnRefNo) {
      res.status(400).json({
        success: false,
        error: 'Transaction reference number is required'
      });
      return;
    }

    const result = await inquireTransactionStatus(String(txnRefNo));

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error: any) {
    console.error('Error getting transaction status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

/**
 * Get Callback Data (for GET requests from JazzCash)
 * GET /api/payment/callback
 */
export async function handleCallbackGet(req: Request, res: Response): Promise<void> {
  // Reuse the POST handler with query params
  req.body = req.query;
  await handleCallback(req, res);
}
