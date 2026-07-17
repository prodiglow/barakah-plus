/**
 * Bank Alfalah APG (Alfa Payment Gateway) Types
 */

export interface AlfalahConfig {
  environment: 'sandbox' | 'production';
  merchantId: string;
  storeId: string;
  channelId: string;
  merchantHash: string;
  merchantUsername: string;
  merchantPassword: string;
  key1: string;
  key2: string;
  returnUrl: string;
}

/** Transaction types supported by APG */
export enum AlfalahTransactionType {
  ALFA_WALLET = '1',
  BANK_ACCOUNT = '2',
  CREDIT_DEBIT_CARD = '3',
}

export interface HandshakeResponse {
  success: string; // "true" | "false"
  AuthToken: string;
  ReturnURL: string;
  ErrorMessage?: string;
}

/** Fields the frontend must POST (hidden form) to the SSO endpoint */
export interface SSOFormPayload {
  url: string;
  fields: Record<string, string>;
}

/** Response of the IPN OrderStatus inquiry */
export interface AlfalahOrderStatus {
  ResponseCode: string; // "00" = success
  Description: string;
  MerchantId: string;
  MerchantName: string;
  StoreId: string;
  StoreName: string;
  TransactionTypeId: string;
  TransactionReferenceNumber: string;
  OrderDateTime: string;
  TransactionId: string;
  TransactionDateTime: string;
  AccountNumber: string | null;
  TransactionAmount: string;
  MobileNumber: string | null;
  TransactionStatus: string; // "Paid" | "Failed" | ...
}

export interface InitiateAlfalahPaymentRequest {
  amount: number;
  orderRef?: string; // merchant transaction reference; generated if absent
  transactionTypeId?: AlfalahTransactionType;
  billReference?: string; // e.g. CART<userId> or order id — mirrors JazzCash usage
  customerName?: string;
  customerEmail?: string;
}
