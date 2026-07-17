import { 
  CustomerInfo,
  MWalletRequestData,
  CardPaymentRequestData,
  PaymentRequestResponse,
  PaymentCallbackResponse,
  StatusInquiryResponse,
  JazzCashCallbackData
} from '../types/jazzcash.types';
import { 
  getJazzCashConfig, 
  getMWalletUrl, 
  getCardPaymentUrl,
  getStatusInquiryUrl 
} from '../config/jazzcash.config';
import {
  generateSecureHash,
  generateCardPaymentHash,
  generateStatusInquiryHash,
  formatDateTime,
  generateTxnRefNo
} from '../utils/jazzcash.hash.utils';

// Check if string is empty or undefined
const isEmpty = (str: string | undefined): boolean => !str || str.trim() === '';

/**
 * Generate MWallet Payment Request
 */
export async function initiateMWalletTransaction(
  amount: number,
  customerInfo: CustomerInfo,
  description: string = 'Payment',
  billReference: string = 'billref'
): Promise<any> {
  try {
    const config = getJazzCashConfig();
    const date = new Date();

    // Validate required fields
    if (!customerInfo.name || customerInfo.name.trim() === '') {
      return { success: false, error: 'Customer name is required' };
    }
    if (!customerInfo.email || customerInfo.email.trim() === '') {
      return { success: false, error: 'Customer email is required' };
    }

    // Format dates
    const txnDateTime = formatDateTime(date);
    
    // Expiry: +24 hours
    const expiryDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    expiryDate.setHours(expiryDate.getHours() + 1);
    const txnExpiryDateTime = formatDateTime(expiryDate);

    // Generate unique transaction reference
    const txnRefNo = generateTxnRefNo();

    // Amount in smallest currency unit (paisa)
    const amountInSmallestUnit = Math.round(amount * 100).toString();


    // Build request data
    // Note: MWallet Redirect Mode logic allows empty MobileNumber if user enters it on page
    const requestData: MWalletRequestData = {
      pp_Version: "1.1",
      pp_TxnType: "MWALLET",
      pp_Language: config.language,
      pp_MerchantID: config.merchantId,
      pp_SubMerchantID: '',
      pp_Password: config.password,
      pp_BankID: '',
      pp_ProductID: "",
      pp_TxnRefNo: txnRefNo,
      pp_Amount: amountInSmallestUnit,
      pp_TxnCurrency: config.currency,
      pp_TxnDateTime: txnDateTime,
      pp_BillReference: billReference,
      pp_Description: description,
      pp_TxnExpiryDateTime: txnExpiryDateTime,
      pp_ReturnURL: config.returnUrl,
      ppmpf_1: customerInfo.phone || '',
      ppmpf_2: '',
      ppmpf_3: '',
      ppmpf_4: '',
      ppmpf_5: ''
    };

    // Generate secure hash
    requestData.pp_SecureHash = generateSecureHash(requestData);
    
    // Log request data for verification
    console.log('📱 MWallet Request Initiated');

    // Clean data: ensure all values are strings and remove empty ones
    const cleanedData: Record<string, string> = {};
    for (const [key, value] of Object.entries(requestData)) {
      if (value !== null && value !== undefined && value !== '') {
        cleanedData[key] = String(value);
      }
    }

    // Perform Server-to-Server API Call
    const apiUrl = getMWalletUrl();
    console.log('📡 Calling JazzCash API:', apiUrl);

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData) 
    });

    const responseData = await response.json();
    console.log('📥 JazzCash API Response Received');

    return {
        success: true,
        data: responseData,
        txnRefNo
    };

  } catch (error: any) {
    console.error('Error generating MWallet request:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate payment request'
    };
  }
}

/**
 * Initiate Card Payment Transaction (Hosted Payment Page)
 */
export async function initiateCardTransaction(
  amount: number,
  customerInfo: CustomerInfo,
  description: string = 'Payment',
  billReference: string = 'billRef'
): Promise<any> {
  try {
    const config = getJazzCashConfig();
    const date = new Date();
    
    // Format dates
    const txnDateTime = formatDateTime(date);

    // Expiry: +3 days
    const expiryDate = new Date(date.getTime() + 3 * 24 * 60 * 60 * 1000);
    const txnExpiryDateTime = formatDateTime(expiryDate);

    // Generate unique transaction reference
    const txnRefNumber = "T" + txnDateTime + Math.floor(Math.random() * 90 + 10);

    // Amount in smallest currency unit (paisa)
    const amountInSmallestUnit = Math.round(amount * 100).toString();

    // Build request data - Matching PHP Payment Page Structure
    // Note: Empty fields are kept as empty strings to match PHP example structure if needed by hash
    const requestData: any = {
      pp_Version: '1.1',
      pp_TxnType: 'MPAY',
      pp_Language: 'EN',
      pp_MerchantID: config.merchantId,
      pp_SubMerchantID: '',
      pp_Password: config.password,
      pp_BankID: '',
      pp_ProductID: '',
      pp_TxnRefNo: txnRefNumber,
      pp_Amount: amountInSmallestUnit,
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: txnDateTime,
      pp_BillReference: billReference,
      pp_Description: description,
      pp_TxnExpiryDateTime: txnExpiryDateTime,
      pp_ReturnURL: config.returnUrl,
      pp_SecureHash: '',
      ppmpf_1: '', // Extra details
      ppmpf_2: '',
      ppmpf_3: '',
      ppmpf_4: '',
      ppmpf_5: ''
    };
    
    // Generate secure hash using the specific Card Payment Page logic
    requestData.pp_SecureHash = generateCardPaymentHash(requestData);

    // Log request data for verification
    console.log('💳 Card Payment Initiated');

    const postUrl = getCardPaymentUrl();

    return {
        success: true,
        postUrl: postUrl,
        formFields: requestData,
        txnRefNo: txnRefNumber,
        message: 'Payment Initiated'
    };

  } catch (error: any) {
    console.error('Error initiating card payment:', error);
    return {
      success: false,
      error: error.message || 'Failed to initiate card payment'
    };
  }
}

/**
 * Process JazzCash Callback
 */
export function processPaymentCallback(callbackData: JazzCashCallbackData): PaymentCallbackResponse {
  const responseCode = callbackData.pp_ResponseCode;
  const responseMessage = callbackData.pp_ResponseMessage;
  const txnRefNo = callbackData.pp_TxnRefNo;
  const amount = callbackData.pp_Amount;

  // JazzCash returns "000" for successful transactions
  const isHashValid = verifyResponseHash(callbackData);
  
  if (!isHashValid) {
     return {
      success: false,
      transactionId: txnRefNo,
      amount: amount,
      error: 'Security verification failed: Invalid Hash',
      responseCode: 'INVALID_HASH'
    };
  }

  if (responseCode === '000') {
    return {
      success: true,
      transactionId: txnRefNo,
      amount: amount,
      message: 'Payment successful',
      responseCode
    };
  }

  return {
    success: false,
    transactionId: txnRefNo,
    amount: amount,
    error: responseMessage || 'Payment failed',
    responseCode
  };
}

/**
 * Inquire Transaction Status via JazzCash API
 */
export async function inquireTransactionStatus(txnRefNo: string): Promise<StatusInquiryResponse> {
  try {
    const config = getJazzCashConfig();

    // Prepare status inquiry request
    const requestData: Record<string, string> = {
      pp_TxnRefNo: txnRefNo,
      pp_MerchantID: config.merchantId,
      pp_Password: config.password
    };

    // Generate secure hash
    requestData.pp_SecureHash = generateStatusInquiryHash(requestData);

    // Get API endpoint
    const apiUrl = getStatusInquiryUrl();

    console.log('📡 Calling Status Inquiry API:', apiUrl);

    // Call JazzCash Status Inquiry API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`JazzCash API error: ${response.statusText}`);
    }

    // Parse JSON response
    const responseData = await response.json() as Record<string, any>;

    console.log('📥 Status Inquiry Response Received');

    // Determine transaction status
    const isInquirySuccessful = responseData.pp_ResponseCode === '000';
    const isTransactionCompleted = responseData.pp_PaymentResponseCode === '121';

    let status: 'completed' | 'failed' | 'pending' | 'unknown' = 'unknown';
    if (isInquirySuccessful) {
      if (isTransactionCompleted) {
        status = 'completed';
      } else if (responseData.pp_PaymentResponseCode) {
        status = 'failed';
      } else {
        status = 'pending';
      }
    }

    // Convert amount from paisa to PKR
    const amount = responseData.pp_Amount
      ? parseFloat(responseData.pp_Amount) / 100
      : undefined;

    return {
      success: isInquirySuccessful,
      transactionId: responseData.pp_TxnRefNo || txnRefNo,
      status,
      amount,
      responseCode: responseData.pp_ResponseCode,
      responseMessage: responseData.pp_ResponseMessage,
      paymentResponseCode: responseData.pp_PaymentResponseCode,
      paymentResponseMessage: responseData.pp_PaymentResponseMessage,
      retrievalReferenceNo: responseData.pp_RetrievalReferenceNo,
      authCode: responseData.pp_AuthCode,
      inquiryDate: new Date().toISOString()
    };

  } catch (error: any) {
    console.error('❌ Status Inquiry Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to inquire transaction status',
      transactionId: txnRefNo
    };
  }
}

/**
 * Verify JazzCash response hash (optional security check)
 */
export function verifyResponseHash(responseData: JazzCashCallbackData): boolean {
  if (!responseData.pp_SecureHash) {
    console.warn('⚠️ No pp_SecureHash found in callback data');
    return false;
  }

  const receivedHash = responseData.pp_SecureHash;
  
  // Calculate expected hash using the same util function
  // generateSecureHash filters out pp_SecureHash and empty fields automatically
  const calculatedHash = generateSecureHash(responseData);

  const isValid = receivedHash === calculatedHash;

  if (!isValid) {
    console.error('❌ Hash Mismatch!');
    console.error('Received:', receivedHash);
    console.error('Calculated:', calculatedHash);
  } else {
    console.log('✅ Hash Verified Successfully');
  }

  return isValid;
}
