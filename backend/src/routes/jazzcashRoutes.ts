import { Router } from 'express';
import {
  healthCheck,
  initiateMWalletPayment,
  initiateCardPayment,
  handleCallback,
  handleCallbackGet,
  getTransactionStatus
} from '../controllers/jazzcashController';

const router = Router();

/**
 * @route   GET /api/payment/health
 * @desc    Health check endpoint
 */
router.get('/health', healthCheck);

/**
 * @route   POST /api/payment/mwallet
 * @desc    Initiate MWallet payment
 * @body    { amount, customerName, customerPhone, customerCnic, customerEmail, description?, billReference? }
 */
router.post('/mwallet', initiateMWalletPayment);

/**
 * @route   POST /api/payment/card
 * @desc    Initiate card payment (Page Redirection v1.1)
 * @body    { amount, customerName, customerEmail, description?, billReference? }
 */
router.post('/card', initiateCardPayment);

/**
 * @route   POST /api/payment/callback
 * @desc    Handle JazzCash callback (POST)
 */
router.post('/callback', handleCallback);

/**
 * @route   GET /api/payment/callback
 * @desc    Handle JazzCash callback (GET)
 */
router.get('/callback', handleCallbackGet);

/**
 * @route   GET /api/payment/status/:txnRefNo
 * @desc    Get transaction status via JazzCash Status Inquiry API
 */
router.get('/status/:txnRefNo', getTransactionStatus);

export default router;
