import express from 'express';

import { sendWhatsAppMessage } from '../services/twilioService';

const router = express.Router();


router.post('/send-whatsapp', async (req, res) => {
    try {
        const result = await sendWhatsAppMessage();
        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
         res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

export default router;
