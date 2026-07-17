import { Request, Response } from 'express';
import { sendOtp, verifyOtp, sendPhoneOtp, verifyPhoneOtp, sendEmail } from '../services/emailService';
import { sendWhatsAppMessage } from '../services/twilioService';

export const sendEmailController = async (req: Request, res: Response): Promise<void> => {
  const { to } = req.body; // Expecting 'to' which is the email

  if (!to) {
    res.status(400).json({ message: 'Missing required field: to (email)' });
    return;
  }

  try {
    // Use sendOtp instead of generic sendEmail
    const result = await sendOtp(to);
    res.status(200).json({ message: 'OTP sent successfully', messageId: result.info.messageId });
  } catch (error: any) {
    console.error('Error in sendEmailController:', error);
    if (error.message === 'User not found') {
       res.status(404).json({ message: 'User not found' });
    } else {
       res.status(500).json({ message: 'Failed to send OTP' });
    }
  }
};

export const sendGenericEmailController = async (req: Request, res: Response): Promise<void> => {
  const { to, subject, text, html } = req.body;

  if (!to || !subject || !text) {
    res.status(400).json({ message: 'Missing required fields: to, subject, text' });
    return;
  }

  try {
    const result = await sendEmail(to, subject, text, html);
    
    // Call Twilio route logic (sendWhatsAppMessage)
    try {
       await sendWhatsAppMessage();
       console.log('Twilio WhatsApp message triggered successfully');
    } catch (twilioError) {
       console.error('Failed to trigger Twilio WhatsApp message:', twilioError);
       // We don't fail the request if Twilio fails, as the email was sent successfully
    }

    res.status(200).json({ message: 'Email sent successfully', messageId: result.messageId });
  } catch (error: any) {
    console.error('Error in sendGenericEmailController:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
};



export const verifyOtpController = async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;
  
    if (!email || !otp) {
      res.status(400).json({ message: 'Missing required fields: email, otp' });
      return;
    }
  
    try {
      const result = await verifyOtp(email, otp);
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in verifyOtpController:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

export const sendPhoneOtpController = async (req: Request, res: Response): Promise<void> => {
  const { phone } = req.body;

  if (!phone) {
    res.status(400).json({ message: 'Missing required field: phone' });
    return;
  }

  try {
    const result = await sendPhoneOtp(phone);
    res.status(200).json({ message: 'OTP generated successfully', otp: result.otp });
  } catch (error) {
    console.error('Error in sendPhoneOtpController:', error);
    res.status(500).json({ message: 'Failed to generate OTP' });
  }
};

export const verifyPhoneOtpController = async (req: Request, res: Response): Promise<void> => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    res.status(400).json({ message: 'Missing required fields: phone, otp' });
    return;
  }

  try {
    const result = await verifyPhoneOtp(phone, otp);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in verifyPhoneOtpController:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
