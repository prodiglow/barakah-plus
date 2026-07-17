import nodemailer from 'nodemailer';
import VerificationToken from '../models/VerificationToken';
import { encrypt, decrypt } from '../utils/encryption';

// const transporter = nodemailer.createTransport({
//   service: process.env.SMTP_SERVICE || "gmail",
//   host: process.env.SMTP_HOST || "smtp.gmail.com",
//   port: parseInt(process.env.SMTP_PORT || "587"),
//   secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
//   auth: {
//     user: process.env.SMTP_EMAIL,
//     pass: process.env.SMTP_PASSWORD,
//   },
//   tls: {
//     rejectUnauthorized: false
//   }
// });
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"Baraka Plus" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_EMAIL}>`,
      to,
      subject,
      text,
      html,
    });
    console.log('Email message sent successfully');
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendPhoneOtp = async (phone: string) => {
  try {
    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration to 10 minutes from now (handled by TTL in VerificationToken)
    const encryptedOtp = encrypt(otp);

    await VerificationToken.findOneAndUpdate(
      { phone },                // search by phone
      { token: encryptedOtp, createdAt: new Date() }, // update fields
      { upsert: true, new: true } // create if not exists, return updated doc
    );

    return { success: true, otp }; // Returning OTP so frontend can show it in alert
  } catch (error) {
    console.error('Error generating phone OTP:', error);
    throw error;
  }
};

export const sendOtp = async (email: string) => {
  try {
    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration to 10 minutes from now
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    const encryptedOtp = encrypt(otp);

    await VerificationToken.findOneAndUpdate(
      { email },                // search by email
      { token: encryptedOtp, createdAt: new Date() }, // update fields
      { upsert: true, new: true } // create if not exists, return updated doc
    );

    const subject = 'Your OTP Code';
    const text = `Your OTP code is ${otp}. It expires in 10 minutes.`;
    const html = `<p>Your OTP code is <b>${otp}</b>. It expires in 10 minutes.</p>`;

    const info = await transporter.sendMail({
      from: `"BARAKA" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_EMAIL}>`,
      to: email,
      subject,
      text,
      html,
    });
    console.log('OTP email sent successfully');
    return { info, otp }; // Returning OTP for testing/verification if needed, though strictly it should be secret
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};


export const verifyPhoneOtp = async (phone: string, otp: string) => {
  try {
    const record = await VerificationToken.findOne({ phone });
    
    if (!record) {
      return { success: false, message: 'OTP not found or expired' };
    }

    // Check if expired
    const now = new Date();
    const expiryTime = new Date(record.createdAt.getTime() + 10 * 60 * 1000); // 10 mins

    if (now > expiryTime) {
       return { success: false, message: 'OTP expired' };
    }

    const decryptedOtp = decrypt(record.token);

    if (decryptedOtp === otp) {
      await VerificationToken.deleteOne({ _id: record._id });
      return { success: true, message: 'Phone Verified Successfully' };
    } else {
      return { success: false, message: 'Invalid OTP' };
    }

  } catch (error) {
    console.error('Error verifying phone OTP:', error);
    throw error;
  }
};

export const verifyOtp = async (email: string, otp: string) => {
  try {
    const record = await VerificationToken.findOne({ email });
    
    if (!record) {
      return { success: false, message: 'OTP not found or expired' };
    }

    // Check if expired
    const now = new Date();
    const expiryTime = new Date(record.createdAt.getTime() + 10 * 60 * 1000); // 10 mins

    if (now > expiryTime) {
       return { success: false, message: 'OTP expired' };
    }

    const decryptedOtp = decrypt(record.token);

    if (decryptedOtp === otp) {
      await VerificationToken.deleteOne({ _id: record._id });
      return { success: true, message: 'OTP Verified Successfully' };
    } else {
      return { success: false, message: 'Invalid OTP' };
    }

  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};
