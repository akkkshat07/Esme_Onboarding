import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SUREPASS_BASE_URL = process.env.SUREPASS_GATEWAY === 'production' 
  ? 'https://kyc-api.surepass.app' 
  : 'https://sandbox.surepass.app';

const AUTHORIZATION_TOKEN = process.env.SUREPASS_AUTHORIZATION_TOKEN;
const WEBHOOK_URL = process.env.SUREPASS_WEBHOOK_URL;

/**
 * Initialize DigiLocker session and get token for SDK
 * @param {Object} options - Configuration options
 * @param {string} options.logoUrl - Your brand logo URL (optional)
 * @param {boolean} options.skipMainScreen - Skip intro screen (default: true)
 * @returns {Promise<Object>} Token and client_id for SDK initialization
 */
export async function initializeDigiLocker(options = {}) {
  try {
    const { logoUrl, skipMainScreen = true } = options;

    const requestData = {
      data: {
        signup_flow: true,
        skip_main_screen: skipMainScreen,
      }
    };

    // Add optional parameters
    if (logoUrl) {
      requestData.data.logo_url = logoUrl;
    }

    // Add webhook URL if configured
    if (WEBHOOK_URL) {
      requestData.data.webhook_url = WEBHOOK_URL;
    }

    const response = await axios.post(
      `${SUREPASS_BASE_URL}/api/v1/digilocker/initialize`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTHORIZATION_TOKEN}`
        }
      }
    );

    if (response.data.success) {
      return {
        success: true,
        token: response.data.data.token,
        clientId: response.data.data.client_id,
        expirySeconds: response.data.data.expiry_seconds || 600,
        gateway: process.env.SUREPASS_GATEWAY
      };
    } else {
      throw new Error(response.data.message || 'Failed to initialize DigiLocker');
    }
  } catch (error) {
    console.error('DigiLocker initialization error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to initialize DigiLocker session');
  }
}

/**
 * Download Aadhaar XML data after successful verification
 * @param {string} clientId - The client_id received from webhook or SDK success callback
 * @returns {Promise<Object>} Aadhaar data including XML
 */
export async function downloadAadhaarData(clientId) {
  try {
    const response = await axios.get(
      `${SUREPASS_BASE_URL}/api/v1/digilocker/download-aadhaar/${clientId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTHORIZATION_TOKEN}`
        }
      }
    );

    if (response.data.success) {
      const { data } = response.data;
      
      return {
        success: true,
        clientId: data.client_id,
        metadata: data.digilocker_metadata,
        aadhaarData: {
          fullName: data.aadhaar_xml_data?.full_name,
          fatherName: data.aadhaar_xml_data?.father_name,
          dob: data.aadhaar_xml_data?.dob,
          gender: data.aadhaar_xml_data?.gender,
          maskedAadhaar: data.aadhaar_xml_data?.masked_aadhaar,
          fullAddress: data.aadhaar_xml_data?.full_address,
          address: data.aadhaar_xml_data?.address,
          profileImage: data.aadhaar_xml_data?.profile_image,
          zip: data.aadhaar_xml_data?.zip
        },
        xmlUrl: data.xml_url
      };
    } else {
      throw new Error(response.data.message || 'Failed to download Aadhaar data');
    }
  } catch (error) {
    console.error('Download Aadhaar error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to download Aadhaar data');
  }
}

/**
 * Verify if credentials are configured
 * @returns {boolean} True if credentials are set
 */
export function isConfigured() {
  return !!(AUTHORIZATION_TOKEN && AUTHORIZATION_TOKEN !== 'YOUR_BEARER_TOKEN_HERE');
}

/**
 * Get configuration status
 * @returns {Object} Configuration details
 */
export function getConfigStatus() {
  return {
    configured: isConfigured(),
    gateway: process.env.SUREPASS_GATEWAY || 'sandbox',
    webhookConfigured: !!(WEBHOOK_URL && !WEBHOOK_URL.includes('localhost'))
  };
}
