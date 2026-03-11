import axios from 'axios';

// Configuration
const SUREPASS_GATEWAY = process.env.SUREPASS_GATEWAY || 'sandbox'; // 'sandbox' or 'production'
const AUTHORIZATION_TOKEN = process.env.SUREPASS_AUTHORIZATION_TOKEN;

// Base URLs
const BASE_URLS = {
  sandbox: 'https://sandbox.surepass.io',
  production: 'https://kyc-api.surepass.io'
};

const SUREPASS_BASE_URL = BASE_URLS[SUREPASS_GATEWAY];

/**
 * Initialize E-Sign token from SurePass
 * @param {string} aadhaarNumber - User's Aadhaar number
 * @param {string} documentBase64 - Base64 encoded PDF document to be signed
 * @param {string} fileName - Name of the document
 * @param {string} purpose - Purpose of E-Sign
 * @returns {Promise<Object>} - Token and initialization data
 */
export async function initializeESign(aadhaarNumber, documentBase64, fileName = 'document.pdf', purpose = 'Employment Document Signature') {
  if (!AUTHORIZATION_TOKEN) {
    throw new Error('Authorization token not configured');
  }

  if (!aadhaarNumber || aadhaarNumber.length !== 12) {
    throw new Error('Valid 12-digit Aadhaar number is required');
  }

  if (!documentBase64) {
    throw new Error('Document is required for E-Sign');
  }

  try {
    console.log(`🔐 Initializing E-Sign for Aadhaar: ${aadhaarNumber.slice(0, 4)}****${aadhaarNumber.slice(-4)}`);

    const response = await axios.post(
      `${SUREPASS_BASE_URL}/api/v1/esign/initialize`,
      {
        aadhaar_number: aadhaarNumber,
        document: documentBase64, // Base64 encoded PDF
        file_name: fileName,
        purpose: purpose,
        // Optional: redirect_url - if using redirect flow instead of SDK
      },
      {
        headers: {
          'Authorization': `Bearer ${AUTHORIZATION_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout for initialization
      }
    );

    console.log(`✅ E-Sign token generated successfully`);

    return {
      success: true,
      token: response.data.data.token,
      client_id: response.data.data.client_id,
      message: 'E-Sign initialized successfully'
    };

  } catch (error) {
    console.error('❌ E-Sign initialization error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });

    // Handle specific error cases
    if (error.response?.status === 400) {
      return {
        success: false,
        error: 'BAD_REQUEST',
        message: error.response.data.message || 'Invalid request parameters',
        status_code: 400
      };
    }

    if (error.response?.status === 401) {
      return {
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid authorization token',
        status_code: 401
      };
    }

    if (error.response?.status === 422) {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        message: error.response.data.message || 'Validation failed',
        status_code: 422
      };
    }

    // Network or other errors
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'TIMEOUT',
        message: 'Request timeout - please try again',
        status_code: 408
      };
    }

    return {
      success: false,
      error: 'ESIGN_INIT_ERROR',
      message: error.message || 'Failed to initialize E-Sign',
      status_code: error.response?.status || 500
    };
  }
}

/**
 * Verify E-Sign completion status
 * @param {string} clientId - Client ID from initialization
 * @returns {Promise<Object>} - Verification result
 */
export async function verifyESignStatus(clientId) {
  if (!AUTHORIZATION_TOKEN) {
    throw new Error('Authorization token not configured');
  }

  if (!clientId) {
    throw new Error('Client ID is required');
  }

  try {
    console.log(`🔍 Verifying E-Sign status for client: ${clientId}`);

    const response = await axios.get(
      `${SUREPASS_BASE_URL}/api/v1/esign/status/${clientId}`,
      {
        headers: {
          'Authorization': `Bearer ${AUTHORIZATION_TOKEN}`
        },
        timeout: 10000
      }
    );

    console.log(`✅ E-Sign status retrieved`);

    return {
      success: true,
      data: response.data.data,
      status: response.data.data.status, // 'completed', 'pending', 'failed'
      message: 'Status retrieved successfully'
    };

  } catch (error) {
    console.error('❌ E-Sign status check error:', error.response?.data || error.message);

    return {
      success: false,
      error: 'STATUS_CHECK_ERROR',
      message: error.response?.data?.message || 'Failed to check E-Sign status',
      status_code: error.response?.status || 500
    };
  }
}

/**
 * Download signed document
 * @param {string} clientId - Client ID from initialization
 * @returns {Promise<Object>} - Signed document data
 */
export async function downloadSignedDocument(clientId) {
  if (!AUTHORIZATION_TOKEN) {
    throw new Error('Authorization token not configured');
  }

  if (!clientId) {
    throw new Error('Client ID is required');
  }

  try {
    console.log(`📥 Downloading signed document for client: ${clientId}`);

    const response = await axios.get(
      `${SUREPASS_BASE_URL}/api/v1/esign/download/${clientId}`,
      {
        headers: {
          'Authorization': `Bearer ${AUTHORIZATION_TOKEN}`
        },
        timeout: 30000,
        responseType: 'arraybuffer' // For binary data
      }
    );

    console.log(`✅ Signed document downloaded successfully`);

    return {
      success: true,
      documentBuffer: Buffer.from(response.data),
      message: 'Signed document downloaded successfully'
    };

  } catch (error) {
    console.error('❌ Document download error:', error.response?.data || error.message);

    return {
      success: false,
      error: 'DOWNLOAD_ERROR',
      message: error.response?.data?.message || 'Failed to download signed document',
      status_code: error.response?.status || 500
    };
  }
}

/**
 * Check if E-Sign service is configured
 * @returns {boolean}
 */
export function isESignConfigured() {
  return !!AUTHORIZATION_TOKEN;
}

/**
 * Get E-Sign configuration status
 * @returns {Object}
 */
export function getESignConfigStatus() {
  return {
    configured: !!AUTHORIZATION_TOKEN,
    gateway: SUREPASS_GATEWAY,
    baseUrl: SUREPASS_BASE_URL
  };
}
