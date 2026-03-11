import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, CheckCircle2, XCircle, AlertCircle, Loader2, Shield } from 'lucide-react';

const PANVerification = ({ userEmail, onVerificationComplete }) => {
  const [panNumber, setPanNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState({
    isVerified: false,
    data: null
  });
  const [configStatus, setConfigStatus] = useState({
    configured: false,
    loading: true
  });

  // Check if PAN verification is configured
  useEffect(() => {
    checkConfiguration();
    checkVerificationStatus();
  }, [userEmail]);

  const checkConfiguration = async () => {
    try {
      const response = await axios.get('/api/pan-verification/config-status');
      setConfigStatus({
        configured: response.data.configured,
        loading: false
      });
    } catch (err) {
      console.error('Failed to check PAN configuration:', err);
      setConfigStatus({
        configured: false,
        loading: false
      });
      setError('PAN verification service is not configured');
    }
  };

  const checkVerificationStatus = async () => {
    try {
      const response = await axios.get(`/api/pan-verification/status/${userEmail}`);
      if (response.data.success && response.data.isVerified) {
        setVerificationStatus({
          isVerified: true,
          data: response.data.data
        });
      }
    } catch (err) {
      console.error('Failed to check verification status:', err);
    }
  };

  const handlePANChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 10) {
      setPanNumber(value);
      setError(null);
    }
  };

  const validatePANFormat = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const handleVerify = async () => {
    // Validate PAN
    if (!panNumber || panNumber.length !== 10) {
      setError('Please enter a valid 10-character PAN number');
      return;
    }

    if (!validatePANFormat(panNumber)) {
      setError('Invalid PAN format. Format: ABCDE1234F (5 letters, 4 digits, 1 letter)');
      return;
    }

    // Validate Full Name
    if (!fullName || fullName.trim().length < 3) {
      setError('Please enter your full name as per PAN card');
      return;
    }

    // Validate DOB
    if (!dob) {
      setError('Please enter your date of birth as per PAN card');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/pan-verification/verify', {
        email: userEmail,
        panNumber: panNumber,
        fullName: fullName.trim(),
        dob: dob
      });

      if (response.data.success) {
        setVerificationStatus({
          isVerified: true,
          data: response.data.data
        });
        
        // Notify parent component
        if (onVerificationComplete) {
          onVerificationComplete(response.data.data);
        }

        setError(null);
        setPanNumber('');
        setFullName('');
        setDob('');
      }
    } catch (err) {
      console.error('PAN verification error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to verify PAN. Please try again.';
      setError(errorMessage);
      
      if (err.response?.data?.alreadyVerified) {
        setVerificationStatus({
          isVerified: true,
          data: err.response.data.data
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleVerify();
    }
  };

  // Configuration loading state
  if (configStatus.loading) {
    return (
      <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
        <Loader2 className="w-5 h-5 animate-spin text-teal-600 mr-2" />
        <span className="text-sm text-gray-600">Checking configuration...</span>
      </div>
    );
  }

  // Configuration error state
  if (!configStatus.configured) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800">Configuration Required</h3>
            <p className="text-xs text-red-600 mt-1">
              PAN verification service is not configured. Please contact administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Already verified state
  if (verificationStatus.isVerified && verificationStatus.data) {
    return (
      <div className="space-y-4">
        <div className="p-6 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-green-800">PAN Verified Successfully</h3>
              <p className="text-xs text-green-600 mt-1">
                Your PAN card has been verified with government records
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-xs text-gray-500 mb-1">PAN Number</p>
              <p className="text-sm font-semibold text-gray-800">{verificationStatus.data.panNumber}</p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-xs text-gray-500 mb-1">Full Name</p>
              <p className="text-sm font-semibold text-gray-800">{verificationStatus.data.fullName}</p>
            </div>
            {verificationStatus.data.dob && (
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                <p className="text-sm font-semibold text-gray-800">{verificationStatus.data.dob}</p>
              </div>
            )}
            {verificationStatus.data.gender && (
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-xs text-gray-500 mb-1">Gender</p>
                <p className="text-sm font-semibold text-gray-800">
                  {verificationStatus.data.gender === 'M' ? 'Male' : verificationStatus.data.gender === 'F' ? 'Female' : 'Other'}
                </p>
              </div>
            )}
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-xs text-gray-500 mb-1">Category</p>
              <p className="text-sm font-semibold text-gray-800">{verificationStatus.data.category || 'Individual'}</p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-xs text-gray-500 mb-1">Aadhaar Linked</p>
              <div className="flex items-center gap-1">
                {verificationStatus.data.aadhaarLinked ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">Yes</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-600">No</span>
                  </>
                )}
              </div>
            </div>
            {verificationStatus.data.maskedAadhaar && (
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-xs text-gray-500 mb-1">Masked Aadhaar</p>
                <p className="text-sm font-semibold text-gray-800">{verificationStatus.data.maskedAadhaar}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Verification form
  return (
    <div className="space-y-4">
      <div className="p-6 bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg border border-teal-200">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-teal-100 rounded-full">
            <CreditCard className="w-6 h-6 text-teal-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-800">Verify Your PAN Card</h3>
            <p className="text-xs text-gray-600 mt-1">
              Enter your PAN number to verify instantly with government records
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
          {/* PAN Number Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PAN Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={panNumber}
              onChange={handlePANChange}
              onKeyPress={handleKeyPress}
              placeholder="ABCDE1234F"
              maxLength={10}
              className={`w-full px-4 py-3 border rounded-lg text-base font-mono uppercase transition-all duration-300 ${
                error 
                  ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-2 focus:ring-teal-500'
              } focus:outline-none`}
              disabled={loading}
            />
            
            <div className="flex items-center gap-2 mt-2">
              <div className={`h-1 flex-1 rounded ${panNumber.length >= 5 ? 'bg-teal-500' : 'bg-gray-200'}`} />
              <div className={`h-1 flex-1 rounded ${panNumber.length >= 9 ? 'bg-teal-500' : 'bg-gray-200'}`} />
              <div className={`h-1 flex-1 rounded ${panNumber.length === 10 ? 'bg-teal-500' : 'bg-gray-200'}`} />
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              {panNumber.length}/10 characters • Format: 5 letters + 4 digits + 1 letter
            </p>
          </div>

          {/* Full Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name (as per PAN Card) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value.toUpperCase())}
              placeholder="FULL NAME AS PER PAN"
              className={`w-full px-4 py-3 border rounded-lg text-base uppercase transition-all duration-300 ${
                error 
                  ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-2 focus:ring-teal-500'
              } focus:outline-none`}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your full name exactly as shown on your PAN card
            </p>
          </div>

          {/* Date of Birth Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth (as per PAN Card) <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border rounded-lg text-base transition-all duration-300 ${
                error 
                  ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-2 focus:ring-teal-500'
              } focus:outline-none`}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your date of birth in DD-MM-YYYY format
            </p>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || panNumber.length !== 10 || !fullName || !dob}
            className={`w-full px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center gap-2 ${
              loading || panNumber.length !== 10 || !fullName || !dob
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 hover:scale-105 hover:shadow-lg'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>Verify PAN Card</span>
              </>
            )}
          </button>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700">
              <p className="font-semibold mb-1">Why verify PAN?</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-600">
                <li>Instant verification with Income Tax Department</li>
                <li>Check if PAN is linked with Aadhaar</li>
                <li>Auto-fill forms with verified details</li>
                <li>Secure and confidential</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PANVerification;
