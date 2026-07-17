import CryptoJS from 'crypto-js';
import { getJazzCashConfig } from '../config/jazzcash.config';

/**
 * Field mapping for hash generation (as per JazzCash documentation)
 */
const FIELD_MAPPING: Record<string, string> = {
  'pp_Amount': 'pp_amount',
  'pp_BillReference': 'pp_billRef',
  'pp_CNIC': 'pp_cnic',
  'pp_Description': 'pp_description',
  'pp_Language': 'pp_language',
  'pp_MerchantID': 'pp_merchantID',
  'pp_MobileNumber': 'pp_mobile',
  'pp_Password': 'pp_password',
  'pp_ReturnURL': 'pp_returnURL',
  'pp_TxnCurrency': 'pp_txnCurrency',
  'pp_TxnDateTime': 'pp_txnDateTime',
  'pp_TxnExpiryDateTime': 'pp_txnExpiryDateTime',
  'pp_TxnRefNo': 'pp_txnRefNo',
  'ppmpf_1': 'ppmpf_1',
  'ppmpf_2': 'ppmpf_2',
  'ppmpf_3': 'ppmpf_3',
  'ppmpf_4': 'ppmpf_4',
  'ppmpf_5': 'ppmpf_5',
};

/**
 * Generate secure hash for MWallet payment (REST API v2.0)
 * 
 * According to JazzCash documentation:
 * 1. Include ALL fields starting with "pp" (excluding pp_SecureHash)
 * 2. Sort fields alphabetically by hash field name
 * 3. Join values with '&' separator
 * 4. Prepend Integrity Salt with '&'
 * 5. Calculate HMAC-SHA256 and convert to UPPERCASE
 */
// export function generateSecureHash(data: Record<string, any>): string {
//   const config = getJazzCashConfig();
  
//   // Get all pp fields (excluding pp_SecureHash)
//   const ppFields: Array<[string, string, string]> = [];
  
//   for (const [key, value] of Object.entries(data)) {
//     if (key.toLowerCase().startsWith('pp') && key !== 'pp_SecureHash') {
//       const hashFieldName = FIELD_MAPPING[key] || key.toLowerCase();
//       const stringValue = value != null ? String(value) : '';
//       ppFields.push([key, hashFieldName, stringValue]);
//     }
//   }

//   // Sort by hash field name in alphabetical order (case-insensitive)
//   ppFields.sort((a, b) => {
//     const nameA = a[1].toLowerCase();
//     const nameB = b[1].toLowerCase();
//     return nameA.localeCompare(nameB);
//   });

//   // Extract values in sorted order and join with '&'
//   const values = ppFields.map(([, , value]) => value);
//   const dataString = values.join('&');
  
//   // Prepend Integrity Salt with '&'
//   const finalString = config.integrityKey + '&' + dataString;

//   // Calculate HMAC-SHA256 with Integrity Salt as secret key
//   const hmac = CryptoJS.HmacSHA256(finalString, config.integrityKey);
//   const hash = hmac.toString(CryptoJS.enc.Hex).toUpperCase();
  
//   return hash;
// }
export function generateSecureHash(data: Record<string, any>): string {
  const config = getJazzCashConfig();
  const salt = config.integrityKey;

  // 1. Filter: Only 'pp_' fields, exclude SecureHash, and SKIP empty/null values
  const keys = Object.keys(data)
    .filter(key => 
      key.toLowerCase().startsWith('pp') && 
      key !== 'pp_SecureHash' && 
      data[key] !== '' && 
      data[key] !== null && 
      data[key] !== undefined
    )
    .sort(); // 2. Alphabetical Sort (A-Z)

  // 3. Concatenate values with '&'
  const messageString = keys
    .map(key => String(data[key]))
    .join('&');

  // 4. Prepend Salt: Format is Salt&Value1&Value2...
  const finalString = `${salt}&${messageString}`;
  
  // 5. HMAC-SHA256 with Salt as the Secret Key
  const hmac = CryptoJS.HmacSHA256(finalString, salt);
  return hmac.toString(CryptoJS.enc.Hex).toUpperCase();
}

/**
 * Generate secure hash for Card Payment (Page Redirection v1.1)
 * 
 * According to PHP sample code:
 * - Parameters in exact order (alphabetical by parameter name)
 * - pp_SubMerchantID is NOT included in hash
 * - Filter out empty values
 * - Join with '&' and prepend HashKey
 */
export function generateCardPaymentHash(data: Record<string, any>): string {
  const config = getJazzCashConfig();
  
  // Parameters in exact order as PHP code (alphabetical)
  const hashArray: any[] = [
    data.pp_Amount || '',
    data.pp_BankID || '',
    data.pp_BillReference || '',
    data.pp_Description || '',
    data.pp_Language || '',
    data.pp_MerchantID || '',
    data.pp_Password || '',
    data.pp_ProductID || '',
    data.pp_ReturnURL || '',
    data.pp_TxnCurrency || '',
    data.pp_TxnDateTime || '',
    data.pp_TxnExpiryDateTime || '',
    data.pp_TxnRefNo || '',
    data.pp_TxnType || '',
    data.pp_Version || '',
    data.ppmpf_1 || '',
    data.ppmpf_2 || '',
    data.ppmpf_3 || '',
    data.ppmpf_4 || '',
    data.ppmpf_5 || ''
  ];

  // Filter out empty values and convert to strings
  const stringArray = hashArray.map(v => String(v || ''));
  const filteredArray = stringArray.filter(
    (value) => value !== 'undefined' && value !== null && value !== ''
  );

  // Start with HashKey, then join filtered values with '&'
  let sortedArray = config.integrityKey;
  for (let i = 0; i < filteredArray.length; i++) {
    sortedArray += '&' + filteredArray[i];
  }

  // Calculate HMAC-SHA256 with HashKey as secret
  const hmac = CryptoJS.HmacSHA256(sortedArray, config.integrityKey);
  const hash = hmac.toString(CryptoJS.enc.Hex).toUpperCase();

  return hash;
}

/**
 * Generate secure hash for Status Inquiry
 */
export function generateStatusInquiryHash(data: Record<string, any>): string {
  const config = getJazzCashConfig();
  
  // Get all PP fields (excluding pp_SecureHash)
  const ppFields: Array<[string, string]> = [];
  
  for (const [key, value] of Object.entries(data)) {
    if (key.toLowerCase().startsWith('pp') && key !== 'pp_SecureHash') {
      const stringValue = value != null ? String(value) : '';
      ppFields.push([key, stringValue]);
    }
  }

  // Sort by field name in alphabetical order (case-insensitive)
  ppFields.sort((a, b) => {
    const nameA = a[0].toLowerCase();
    const nameB = b[0].toLowerCase();
    return nameA.localeCompare(nameB);
  });

  // Extract values and join with '&'
  const values = ppFields.map(([, value]) => value);
  const dataString = values.join('&');
  
  // Prepend Integrity Salt
  const finalString = config.integrityKey + '&' + dataString;

  // Calculate HMAC-SHA256
  const hmac = CryptoJS.HmacSHA256(finalString, config.integrityKey);
  const hash = hmac.toString(CryptoJS.enc.Hex).toUpperCase();

  return hash;
}

/**
 * Format date as YYYYMMDDHHMMSS
 */
export function formatDateTime(date: Date): string {
  return date.getFullYear().toString() +
    ('0' + (date.getMonth() + 1)).slice(-2) +
    ('0' + date.getDate()).slice(-2) +
    ('0' + date.getHours()).slice(-2) +
    ('0' + date.getMinutes()).slice(-2) +
    ('0' + date.getSeconds()).slice(-2);
}

/**
 * Generate unique transaction reference number
 * Format: T + YYYYMMDDHHMMSS + random (max 20 chars)
 */
export function generateTxnRefNo(): string {
  const date = new Date();
  const dateStr = formatDateTime(date);
  const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const txnRefNo = 'T' + dateStr + randomSuffix;
  
  // Ensure max 20 characters
  return txnRefNo.substring(0, 20);
}
