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
 * Verify PAN using SurePass PAN v3 API
 * @param {string} panNumber - PAN number to verify (e.g., "ABCDE1234F")
 * @param {string} fullName - Full name as per PAN card
 * @param {string} dob - Date of birth in YYYY-MM-DD format
 * @returns {Promise<Object>} Verification result with PAN details
 */
export async function verifyPAN(panNumber, fullName, dob) {
  if (!AUTHORIZATION_TOKEN) {
    throw new Error('SurePass authorization token not configured');
  }

  if (!panNumber || panNumber.length !== 10) {
    throw new Error('Invalid PAN number format. Must be 10 characters.');
  }

  if (!fullName || fullName.trim().length < 3) {
    throw new Error('Full name is required.');
  }

  if (!dob) {
    throw new Error('Date of birth is required.');
  }

  try {
    console.log(`🔍 Verifying PAN: ${panNumber} with name: ${fullName} and DOB: ${dob}`);

    const response = await axios.post(
      `${SUREPASS_BASE_URL}/api/v1/pan/pan-adv-v3`,
      {
        id_number: panNumber.toUpperCase(),
        name: fullName.toUpperCase(),
        dob: dob
      },
      {
        headers: {
          'Authorization': `Bearer ${AUTHORIZATION_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ PAN verification response received');

    if (response.data.success) {
      const data = response.data.data;
      
      // Parse name into components (split by spaces)
      const nameParts = data.name ? data.name.split(' ') : [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';
      
      return {
        success: true,
        data: {
          panNumber: data.pan_number,
          fullName: data.name,
          firstName: firstName,
          middleName: middleName,
          lastName: lastName,
          // PAN Advanced API specific fields
          dob: data.dob, // Date of birth in YYYY-MM-DD format
          panStatus: data.pan_status, // "EXISTING AND VALID"
          nameStatus: data.name_status, // "MATCHING" or "NOT MATCHING"
          dobStatus: data.dob_status, // "MATCHING" or "NOT MATCHING"
          aadhaarSeedingStatus: data.aadhaar_seeding_status, // "OPERATIVE PAN"
          status: data.pan_status === 'EXISTING AND VALID' ? 'valid' : 'invalid',
          aadhaarLinked: data.aadhaar_seeding_status === 'OPERATIVE PAN',
          // Additional fields
          category: 'Individual',
          lastUpdated: new Date().toISOString()
        },
        message: 'PAN verified successfully'
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'PAN verification failed',
        error: response.data.error
      };
    }
  } catch (error) {
    console.error('❌ PAN verification error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response) {
      const statusCode = error.response.status;
      const errorData = error.response.data;

      if (statusCode === 400) {
        return {
          success: false,
          message: 'Invalid PAN number format',
          error: errorData.message || 'Bad Request'
        };
      }

      if (statusCode === 404) {
        return {
          success: false,
          message: 'PAN not found or invalid',
          error: 'PAN does not exist'
        };
      }

      if (statusCode === 422) {
        return {
          success: false,
          message: 'PAN validation failed',
          error: errorData.message || 'Unprocessable Entity'
        };
      }

      return {
        success: false,
        message: errorData.message || 'PAN verification failed',
        error: errorData.error || 'API Error'
      };
    }

    throw error;
  }
}

/**
 * Check if PAN verification is configured
 * @returns {boolean} Configuration status
 */
export function isConfigured() {
  return !!(AUTHORIZATION_TOKEN && SUREPASS_GATEWAY);
}

/**
 * Get configuration status details
 * @returns {Object} Configuration details
 */
export function getConfigStatus() {
  return {
    configured: isConfigured(),
    gateway: SUREPASS_GATEWAY,
    hasToken: !!AUTHORIZATION_TOKEN
  };
}
