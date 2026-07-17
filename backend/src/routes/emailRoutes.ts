import express from 'express';
import { sendEmailController, sendGenericEmailController, verifyOtpController, sendPhoneOtpController, verifyPhoneOtpController } from '../controllers/emailController';

const router = express.Router();

router.post('/send', sendEmailController);
router.post('/send-generic', sendGenericEmailController);
router.post('/verify', verifyOtpController);
router.post('/send-phone', sendPhoneOtpController);
router.post('/verify-phone', verifyPhoneOtpController);

export default router;

