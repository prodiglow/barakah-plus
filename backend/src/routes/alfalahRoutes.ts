import express from 'express';
import {
  healthCheck,
  initiatePayment,
  handleReturn,
  handleListener,
  getOrderStatus,
} from '../controllers/alfalahController';

const router = express.Router();

// Health / config check
router.get('/health', healthCheck);

// Initiate payment: handshake + SSO form payload
router.post('/initiate', initiatePayment);

// APG Return URL — result may arrive as query params or as path segments
// (/return/TS=P/RC=00/RD=/O=ref). A regex route matches the tail without
// letting Express decode it into a param (which throws on a stray '%').
router.all(/^\/return(?:\/.*)?$/, handleReturn);

// APG IPN listener webhook (must be whitelisted with Bank Alfalah)
router.all('/listener', handleListener);

// Manual status inquiry
router.get('/status/:orderRef', getOrderStatus);

export default router;
