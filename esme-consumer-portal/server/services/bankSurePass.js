import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AUTHORIZATION_TOKEN = process.env.SUREPASS_AUTHORIZATION_TOKEN;
const SUREPASS_GATEWAY = process.env.SUREPASS_GATEWAY || 'sandbox';

// Determine base URL based on gateway
const SUREPASS_BASE_URL = SUREPASS_GATEWAY === 'production' 
  ? 'https://kyc-api.surepass.app'
  : 'https://sandbox.surepass.app';

/**
 * Verify Bank Account using SurePass Bank Verification API
 * @param {string} accountNumber - Bank account number
 * @param {string} ifsc - IFSC code of the bank branch
 * @returns {Promise<Object>} Verification result with bank account details
 */
export async function verifyBankAccount(accountNumber, ifsc) {
  if (!AUTHORIZATION_TOKEN) {
    throw new Error('SurePass authorization token not configured');
  }

  if (!accountNumber || accountNumber.length < 9) {
    throw new Error('Invalid account number. Must be at least 9 digits.');
  }

  if (!ifsc || ifsc.length !== 11) {
    throw new Error('Invalid IFSC code. Must be 11 characters.');
  }

  try {
    console.log(`🔍 Verifying Bank Account: ${accountNumber} with IFSC: ${ifsc}`);

    const response = await axios.post(
      `${SUREPASS_BASE_URL}/api/v1/bank-verification/`,
      {
        id_number: accountNumber,
        ifsc: ifsc.toUpperCase(),
        ifsc_details: true
      },
      {
        headers: {
          'Authorization': `Bearer ${AUTHORIZATION_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Bank verification response received');

    if (response.data.success) {
      const data = response.data.data;
      
      return {
        success: true,
        data: {
          accountNumber: accountNumber,
          ifsc: ifsc.toUpperCase(),
          accountExists: data.account_exists,
          fullName: data.full_name,
          upiId: data.upi_id,
          impsRefNo: data.imps_ref_no,
          remarks: data.remarks,
          status: data.status,
          // IFSC Details
          bankName: data.ifsc_details?.bank_name || data.ifsc_details?.bank,
          branch: data.ifsc_details?.branch,
          city: data.ifsc_details?.city,
          state: data.ifsc_details?.state,
          address: data.ifsc_details?.address,
          contact: data.ifsc_details?.contact,
          micr: data.ifsc_details?.micr,
          // Payment Methods Support
          impsEnabled: data.ifsc_details?.imps || false,
          rtgsEnabled: data.ifsc_details?.rtgs || false,
          neftEnabled: data.ifsc_details?.neft || false,
          upiEnabled: data.ifsc_details?.upi || false,
          lastUpdated: new Date().toISOString()
        },
        message: 'Bank account verified successfully'
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Bank account verification failed',
        error: response.data.error
      };
    }
  } catch (error) {
    console.error('❌ Bank verification error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response) {
      const statusCode = error.response.status;
      const errorData = error.response.data;

      if (statusCode === 400) {
        return {
          success: false,
          message: 'Invalid account number or IFSC code',
          error: errorData.message || 'Bad Request'
        };
      }

      if (statusCode === 422) {
        return {
          success: false,
          message: errorData.message || 'Bank account not found or invalid',
          error: 'Unprocessable Entity'
        };
      }

      if (statusCode === 401) {
        return {
          success: false,
          message: 'Bank verification service authentication failed',
          error: 'Unauthorized'
        };
      }

      return {
        success: false,
        message: errorData.message || 'Bank verification failed',
        error: errorData.error || 'Unknown error'
      };
    }

    // Network or other errors
    return {
      success: false,
      message: error.message || 'Failed to connect to verification service',
      error: 'Network Error'
    };
  }
}

/**
 * Check if Bank verification is configured
 * @returns {boolean} Configuration status
 */
export function isConfigured() {
  return !!AUTHORIZATION_TOKEN;
}

/**
 * Get configuration status details
 * @returns {Object} Configuration details
 */
export function getConfigStatus() {
  return {
    configured: isConfigured(),
    gateway: SUREPASS_GATEWAY,
    baseUrl: SUREPASS_BASE_URL
  };
}
