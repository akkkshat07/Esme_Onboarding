import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertCircle, Loader2, FileText, User } from 'lucide-react';
import axios from 'axios';

const AadhaarDigiLockerVerification = ({ userEmail, onVerificationComplete }) => {
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [error, setError] = useState(null);
  const [configStatus, setConfigStatus] = useState(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // Load SurePass DigiBoost SDK
  useEffect(() => {
    // Check if SDK already available
    if (window.DigiboostSdk) {
      setSdkLoaded(true);
    }

    const existingScript = document.querySelector('script[src*="surepass-digiboost-web-sdk"]');
    let loadTimer;
    let pollTimer;
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/surepassio/surepass-digiboost-web-sdk@latest/index.min.js';
      script.async = true;
      script.onload = () => {
        console.log('✅ DigiBoost SDK loaded (fresh)');
        setSdkLoaded(true);
        clearTimeout(loadTimer);
      };
      script.onerror = () => {
        console.error('❌ Failed to load DigiBoost SDK');
        setError('Failed to load verification SDK. Please check your internet connection.');
        clearTimeout(loadTimer);
      };
      document.body.appendChild(script);

      // Set timeout for SDK loading (Reduced to 5s)
      loadTimer = setTimeout(() => {
        if (!window.DigiboostSdk) {
            console.error('❌ DigiBoost SDK load timeout');
            setError('Verification SDK taking too long to load.');
        }
      }, 5000);

    } else {
      // Script exists - poll for SDK readiness
      console.log('🔄 DigiBoost script exists, polling for SDK...');
      pollTimer = setInterval(() => {
        if (window.DigiboostSdk) {
          console.log('✅ DigiBoost SDK detected (polling)');
          setSdkLoaded(true);
          clearInterval(pollTimer);
          clearTimeout(loadTimer);
        }
      }, 200);

      // Fallback if polling fails
      loadTimer = setTimeout(() => {
        clearInterval(pollTimer);
        if (window.DigiboostSdk) {
             setSdkLoaded(true);
        } else {
             console.error('❌ DigiBoost SDK poll timeout');
             // Don't error hard if it might be loaded but undetected? 
             // Better to error so loader stops.
             setError('Verification SDK not responding. Please refresh.');
        }
      }, 5000);
    }

    // Check configuration status
    checkConfigStatus();
    
    // Check existing verification status
    checkVerificationStatus();

    return () => {
        clearTimeout(loadTimer);
        if (pollTimer) clearInterval(pollTimer);
    };
  }, [userEmail]);

  const checkConfigStatus = async () => {
    try {
      const response = await axios.get('/api/aadhaar-digilocker/config-status');
      setConfigStatus(response.data);
    } catch (err) {
      console.error('Failed to check config status:', err);
    }
  };

  const checkVerificationStatus = async () => {
    try {
      const response = await axios.get(`/api/aadhaar-digilocker/status/${userEmail}`);
      if (response.data.success) {
        setVerificationStatus(response.data);
      }
    } catch (err) {
      console.error('Failed to check verification status:', err);
    }
  };

  const handleVerifyAadhaar = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize DigiLocker session
      const initResponse = await axios.post('/api/aadhaar-digilocker/initialize', {
        email: userEmail
        // logoUrl is optional - only pass if you have a full URL (https://...)
      });

      if (!initResponse.data.success) {
        throw new Error(initResponse.data.message);
      }

      const { token, gateway, clientId } = initResponse.data;

      // Initialize DigiBoost SDK
      if (window.DigiboostSdk) {
        // Create a container for the SDK button
        const container = document.getElementById('digilocker-sdk-container');
        if (container) {
          container.innerHTML = ''; // Clear any existing content
        }

        window.DigiboostSdk({
          gateway: gateway,
          token: token,
          selector: '#digilocker-sdk-container',
          style: {
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '14px 32px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            boxShadow: '0 4px 6px rgba(37, 99, 235, 0.3)',
            transition: 'all 0.2s ease'
          },
          onSuccess: async (data) => {
            console.log('✅ DigiLocker verification successful:', data);
            
            try {
              // Complete verification on backend
              const completeResponse = await axios.post('/api/aadhaar-digilocker/complete', {
                email: userEmail,
                clientId: clientId
              });

              if (completeResponse.data.success) {
                setVerificationStatus({
                  isVerified: true,
                  data: completeResponse.data.data
                });
                setError(null);
                
                // Refresh status
                await checkVerificationStatus();
                
                // Notify parent component to refresh user data
                if (onVerificationComplete) {
                  onVerificationComplete(completeResponse.data.data);
                }
                
                alert('✅ Aadhaar verified successfully via DigiLocker!');
              }
            } catch (err) {
              console.error('Error completing verification:', err);
              setError('Verification completed but failed to save. Please contact support.');
            } finally {
              setLoading(false);
            }
          },
          onFailure: (error) => {
            console.log('❌ DigiLocker verification failed:', error);
            setError('Verification was cancelled or failed. Please try again.');
            setLoading(false);
          }
        });

        setLoading(false);
      } else {
        throw new Error('DigiBoost SDK not loaded. Please refresh the page.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to start verification');
      setLoading(false);
    }
  };

  // If service not configured
  if (configStatus && !configStatus.configured) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              Aadhaar Verification Service Not Available
            </h3>
            <p className="text-sm text-yellow-800">
              The DigiLocker Aadhaar verification service is currently not configured. 
              Please contact your administrator to enable this feature.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If already verified
  if (verificationStatus?.isVerified) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-900 mb-1">
              Aadhaar Verified Successfully
            </h3>
            <p className="text-sm text-green-700">
              Your Aadhaar has been verified via DigiLocker
            </p>
          </div>
        </div>

        {verificationStatus.data && (
          <div className="bg-white rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="text-sm font-medium text-gray-900">
                  {verificationStatus.data.fullName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Aadhaar Number</p>
                <p className="text-sm font-medium text-gray-900">
                  {verificationStatus.data.maskedAadhaar}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Date of Birth</p>
                <p className="text-sm font-medium text-gray-900">
                  {verificationStatus.data.dob}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Gender</p>
                <p className="text-sm font-medium text-gray-900">
                  {verificationStatus.data.gender}
                </p>
              </div>
            </div>

            {verificationStatus.data.profileImage && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Profile Photo</p>
                <img 
                  src={`data:image/jpeg;base64,${verificationStatus.data.profileImage}`}
                  alt="Aadhaar Profile"
                  className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Verification interface
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Verify Your Aadhaar via DigiLocker
          </h3>
          <p className="text-sm text-gray-600">
            Securely verify your Aadhaar using your DigiLocker account. This is a government-backed verification process.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">What you'll need:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Your Aadhaar linked to DigiLocker</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>OTP access to your registered mobile number</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>This process takes less than 2 minutes</span>
          </li>
        </ul>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* SDK Button Container - SDK will inject button here */}
      <div id="digilocker-sdk-container" className="mb-4"></div>

      {/* Only show our button if SDK hasn't loaded yet */}
      {!loading && sdkLoaded && (
        <button
          onClick={handleVerifyAadhaar}
          disabled={loading || !sdkLoaded}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Shield className="w-5 h-5" />
          Start Verification
        </button>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 text-blue-600 py-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Initializing DigiLocker...</span>
        </div>
      )}

      {!sdkLoaded && !error && (
        <div className="flex items-center justify-center gap-2 text-gray-500 py-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading verification SDK...</span>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center mt-4">
        🔒 Your information is encrypted and securely transmitted through DigiLocker's official channels
      </p>
    </div>
  );
};

export default AadhaarDigiLockerVerification;
