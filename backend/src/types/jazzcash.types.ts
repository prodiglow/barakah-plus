/**
 * JazzCash Configuration Interface
 */
export interface JazzCashConfig {
  merchantId: string;
  password: string;
  returnUrl: string;
  apiVersion: string;
  language: string;
  currency: string;
  integrityKey: string;
  environment: 'sandbox' | 'production';
}

/**
 * Customer Information for payment
 */
export interface CustomerInfo {
  name: string;
  phone: string;
  cnic: string;
  email: string;
}

/**
 * Cart Item (optional, for tracking purposes)
 */
export interface CartItem {
  id: string;
  title: string;
  amount: number;
  description?: string;
}

/**
 * MWallet Payment Request Data
 */
export interface MWalletRequestData {
  pp_Language: string;
  pp_MerchantID: string;
  pp_SubMerchantID?: string;
  pp_Password: string;
  pp_TxnRefNo: string;
  pp_BankID: string;
  pp_ProductID: string;
  pp_TxnType: string;
  pp_Amount: string;
  pp_DiscountedAmount?: string;
  pp_TxnCurrency: string;
  pp_TxnDateTime: string;
  pp_Version: string;
  pp_BillReference: string;
  pp_Description: string;
  pp_TxnExpiryDateTime: string;
  pp_ReturnURL: string;
  pp_MobileNumber?: string;
  pp_CNIC?: string;
  pp_CustomerEmail?: string;
  pp_CustomerID?: string;
  pp_TokenizedCardNumber?: string;
  pp_IsRegisteredCustomer?: string;
  pp_SecureHash?: string;
  ppmpf_1: string;
  ppmpf_2: string;
  ppmpf_3: string;
  ppmpf_4: string;
  ppmpf_5: string;
}

/**
 * Card Payment Request Data (v2.0 Direct Pay)
 */
export interface CardPaymentRequestData {
  pp_IsRegisteredCustomer: string;
  pp_ShouldTokenizeCardNumber: string;
  pp_CustomerID: string;
  pp_CustomerEmail: string;
  pp_CustomerMobile: string;
  pp_Version: string;
  pp_TxnType: string;
  pp_TxnRefNo: string;
  pp_MerchantID: string;
  pp_Password: string;
  pp_Amount: string;
  pp_TxnCurrency: string;
  pp_TxnDateTime: string;
  pp_TxnExpiryDateTime: string;
  pp_BillReference: string;
  pp_Description: string;
  pp_CustomerCardNumber: string;
  pp_CustomerCardCVV: string;
  pp_CustomerCardExpiry: string;
  pp_SecureHash?: string;
  pp_UsageMode: string;
  pp_Language: string;
  pp_ReturnURL: string;
}

/**
 * JazzCash Callback Data
 */
export interface JazzCashCallbackData {
  pp_ResponseCode?: string;
  pp_ResponseMessage?: string;
  pp_TxnRefNo?: string;
  pp_Amount?: string;
  pp_TxnDateTime?: string;
  pp_SecureHash?: string;
  pp_AuthCode?: string;
  pp_RetrievalReferenceNo?: string;
  [key: string]: string | undefined;
}

/**
 * Payment Request Response
 */
export interface PaymentRequestResponse {
  success: boolean;
  redirectData?: Record<string, string>;
  redirectUrl?: string;
  txnRefNo?: string;
  error?: string;
}

/**
 * Payment Callback Response
 */
export interface PaymentCallbackResponse {
  success: boolean;
  transactionId?: string;
  amount?: string;
  message?: string;
  error?: string;
  responseCode?: string;
}

/**
 * Status Inquiry Response
 */
export interface StatusInquiryResponse {
  success: boolean;
  transactionId?: string;
  status?: 'completed' | 'failed' | 'pending' | 'unknown';
  amount?: number;
  responseCode?: string;
  responseMessage?: string;
  paymentResponseCode?: string;
  paymentResponseMessage?: string;
  retrievalReferenceNo?: string;
  authCode?: string;
  inquiryDate?: string;
  error?: string;
}

/**
 * API Request Bodies
 */
export interface InitiatePaymentRequest {
  amount: number;
  customerName: string;
  customerPhone?: string;
  customerCnic?: string;
  customerEmail: string;
  cardNumber?: string;
  cardCvv?: string;
  cardExpiry?: string;
  description?: string;
  billReference?: string;
}
