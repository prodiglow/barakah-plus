import { AlfalahConfig } from '../types/alfalah.types';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Bank Alfalah APG API URLs
 */
export const ALFALAH_URLS = {
  HANDSHAKE_SANDBOX: 'https://sandbox.bankalfalah.com/HS/HS/HS',
  HANDSHAKE_PRODUCTION: 'https://payments.bankalfalah.com/HS/HS/HS',

  SSO_SANDBOX: 'https://sandbox.bankalfalah.com/SSO/SSO/SSO',
  SSO_PRODUCTION: 'https://payments.bankalfalah.com/SSO/SSO/SSO',

  // IPN status inquiry: append /{merchantId}/{storeId}/{orderRef}
  IPN_SANDBOX: 'https://sandbox.bankalfalah.com/HS/api/IPN/OrderStatus',
  IPN_PRODUCTION: 'https://payments.bankalfalah.com/HS/api/IPN/OrderStatus',
};

export function getAlfalahConfig(): AlfalahConfig {
  const environment = (process.env.ALFALAH_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production';

  return {
    environment,
    merchantId: process.env.ALFALAH_MERCHANT_ID || '',
    storeId: process.env.ALFALAH_STORE_ID || '',
    channelId: process.env.ALFALAH_CHANNEL_ID || '1001',
    merchantHash: process.env.ALFALAH_MERCHANT_HASH || '',
    merchantUsername: process.env.ALFALAH_MERCHANT_USERNAME || '',
    merchantPassword: process.env.ALFALAH_MERCHANT_PASSWORD || '',
    key1: process.env.ALFALAH_KEY1 || '',
    key2: process.env.ALFALAH_KEY2 || '',
    returnUrl: process.env.ALFALAH_RETURN_URL || '',
  };
}

export function getHandshakeUrl(): string {
  return getAlfalahConfig().environment === 'production'
    ? ALFALAH_URLS.HANDSHAKE_PRODUCTION
    : ALFALAH_URLS.HANDSHAKE_SANDBOX;
}

export function getSSOUrl(): string {
  return getAlfalahConfig().environment === 'production'
    ? ALFALAH_URLS.SSO_PRODUCTION
    : ALFALAH_URLS.SSO_SANDBOX;
}

export function getIPNUrl(orderRef: string): string {
  const config = getAlfalahConfig();
  const base = config.environment === 'production' ? ALFALAH_URLS.IPN_PRODUCTION : ALFALAH_URLS.IPN_SANDBOX;
  return `${base}/${config.merchantId}/${config.storeId}/${encodeURIComponent(orderRef)}`;
}

export function validateAlfalahConfig(): { valid: boolean; errors: string[] } {
  const config = getAlfalahConfig();
  const errors: string[] = [];

  if (!config.merchantId) errors.push('ALFALAH_MERCHANT_ID is required');
  if (!config.storeId) errors.push('ALFALAH_STORE_ID is required');
  if (!config.merchantHash) errors.push('ALFALAH_MERCHANT_HASH is required');
  if (!config.merchantUsername) errors.push('ALFALAH_MERCHANT_USERNAME is required');
  if (!config.merchantPassword) errors.push('ALFALAH_MERCHANT_PASSWORD is required');
  if (!config.key1) errors.push('ALFALAH_KEY1 is required');
  if (!config.key2) errors.push('ALFALAH_KEY2 is required');
  if (!config.returnUrl) errors.push('ALFALAH_RETURN_URL is required');

  return { valid: errors.length === 0, errors };
}
