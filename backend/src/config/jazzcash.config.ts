import { JazzCashConfig } from '../types/jazzcash.types';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * JazzCash API URLs
 */
export const JAZZCASH_URLS = {
  // MWallet URLs
  MWALLET_SANDBOX: 'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/Payment/DoTransaction',
  MWALLET_PRODUCTION: 'https://payments.jazzcash.com.pk/ApplicationAPI/API/Payment/DoTransaction',
  
  // Card Payment URLs (Hosted Payment Page)
  CARD_SANDBOX: 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/',
  CARD_PRODUCTION: 'https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform',
  
  // Status Inquiry URLs
  STATUS_INQUIRY_SANDBOX: 'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/PaymentInquiry/Inquire',
  STATUS_INQUIRY_PRODUCTION: 'https://payments.jazzcash.com.pk/ApplicationAPI/API/PaymentInquiry/Inquire'
};

/**
 * Get JazzCash Configuration from environment variables
 */
export function getJazzCashConfig(): JazzCashConfig {
  const environment = (process.env.JAZZCASH_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production';
  
  return {
    merchantId: process.env.JAZZCASH_MERCHANT_ID || '',
    password: process.env.JAZZCASH_PASSWORD || '',
    returnUrl: process.env.JAZZCASH_RETURN_URL || 'https://barakah-project-be.vercel.app/api/payment/callback',
    apiVersion: '1.1',
    language: 'EN',
    currency: 'PKR',
    integrityKey: process.env.JAZZCASH_INTEGRITY_SALT || '',
    environment
  };
}

/**
 * Get the appropriate MWallet URL based on environment
 */
export function getMWalletUrl(): string {
  const config = getJazzCashConfig();
  return config.environment === 'production' 
    ? JAZZCASH_URLS.MWALLET_PRODUCTION 
    : JAZZCASH_URLS.MWALLET_SANDBOX;
}

/**
 * Get the appropriate Card Payment URL based on environment
 */
export function getCardPaymentUrl(): string {
  const config = getJazzCashConfig();
  return config.environment === 'production' 
    ? JAZZCASH_URLS.CARD_PRODUCTION 
    : JAZZCASH_URLS.CARD_SANDBOX;
}

/**
 * Get the appropriate Status Inquiry URL based on environment
 */
export function getStatusInquiryUrl(): string {
  const config = getJazzCashConfig();
  return config.environment === 'production' 
    ? JAZZCASH_URLS.STATUS_INQUIRY_PRODUCTION 
    : JAZZCASH_URLS.STATUS_INQUIRY_SANDBOX;
}

/**
 * Validate configuration
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const config = getJazzCashConfig();
  const errors: string[] = [];
  
  if (!config.merchantId) {
    console.log(config.merchantId);
    errors.push('JAZZCASH_MERCHANT_ID is required');
  }
  if (!config.password) {
    console.log(config.password);
    errors.push('JAZZCASH_PASSWORD is required');
  }
  if (!config.integrityKey) {
    console.log(config.integrityKey);
    errors.push('JAZZCASH_INTEGRITY_SALT is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
