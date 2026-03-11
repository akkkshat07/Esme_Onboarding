import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, CheckCircle2, XCircle, AlertCircle, Loader2, Shield } from 'lucide-react';

const BankVerification = ({ userEmail, onVerificationComplete }) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
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

  // Check if Bank verification is configured
  useEffect(() => {
    checkConfiguration();
    checkVerificationStatus();
  }, [userEmail]);

  const checkConfiguration = async () => {
    try {
      const response = await axios.get('/api/bank-verification/config-status');
      setConfigStatus({
        configured: response.data.configured,
        loading: false
      });
    } catch (err) {
      console.error('Failed to check Bank configuration:', err);
      setConfigStatus({
        configured: false,
        loading: false
      });
      setError('Bank verification service is not configured');
    }
  };

  const checkVerificationStatus = async () => {
    try {
      const response = await axios.get(`/api/bank-verification/status/${userEmail}`);
      if (response.data.isVerified) {
        setVerificationStatus({
          isVerified: true,
          data: response.data.data
        });
      }
    } catch (err) {
      console.error('Failed to check verification status:', err);
    }
  };

  const handleAccountNumberChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Only numbers
    setAccountNumber(value);
    setError(null);
  };

  const handleIFSCChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); // Only alphanumeric
    if (value.length <= 11) {
      setIfsc(value);
      setError(null);
    }
  };

  const validateIFSCFormat = (ifscCode) => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifscCode);
  };

  const handleVerify = async () => {
    // Validate Account Number
    if (!accountNumber || accountNumber.length < 9) {
      setError('Please enter a valid account number (minimum 9 digits)');
      return;
    }

    // Validate IFSC
    if (!ifsc || ifsc.length !== 11) {
      setError('Please enter a valid 11-character IFSC code');
      return;
    }

    if (!validateIFSCFormat(ifsc)) {
      setError('Invalid IFSC format. Format: ABCD0123456 (4 letters + 0 + 6 alphanumeric)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/bank-verification/verify', {
        email: userEmail,
        accountNumber: accountNumber,
        ifsc: ifsc
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
        setAccountNumber('');
        setIfsc('');
      }
    } catch (err) {
      console.error('Bank verification error:', err);
      
      // Handle different error types with user-friendly messages
      let errorMessage = 'Failed to verify bank account. Please try again.';
      
      if (err.response?.status === 422) {
        // Check if we have partial verification (valid IFSC but account not found)
        if (err.response.data.partialVerification && err.response.data.data) {
          errorMessage = `⚠️ Account number could not be verified, but your IFSC is valid!\n\nBank: ${err.response.data.data.bankName || 'N/A'}\nBranch: ${err.response.data.data.branch || 'N/A'}\nCity: ${err.response.data.data.city || 'N/A'}\n\nPlease double-check your account number.`;
        } else {
          errorMessage = err.response.data.message || 'Bank account does not exist or is invalid. Please verify your account number and IFSC code.';
        }
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid account details. Please check your account number and IFSC code.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Verification service authentication failed. Please contact support.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
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
    if (e.key === 'Enter' && accountNumber.length >= 9 && ifsc.length === 11) {
      handleVerify();
    }
  };

  if (configStatus.loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!configStatus.configured) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
          <div>
            <h3 className="text-base font-semibold text-yellow-800">Bank Verification Not Available</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Bank account verification service is not configured. Please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show success card if already verified
  if (verificationStatus.isVerified && verificationStatus.data) {
    return (
      <div className="space-y-4">
        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-green-800">Bank Account Verified Successfully</h3>
              <p className="text-xs text-green-600 mt-1">
                Your bank account has been verified with live bank records
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-xs text-gray-500 mb-1">Account Number</p>
              <p className="text-sm font-semibold text-gray-800">
                {verificationStatus.data.accountNumber.slice(0, -4).replace(/./g, '*') + verificationStatus.data.accountNumber.slice(-4)}
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-xs text-gray-500 mb-1">IFSC Code</p>
              <p className="text-sm font-semibold text-gray-800">{verificationStatus.data.ifsc}</p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-xs text-gray-500 mb-1">Account Holder Name</p>
              <p className="text-sm font-semibold text-gray-800">{verificationStatus.data.fullName || 'N/A'}</p>
            </div>
            <div className="bg-white p-3 rounded border border-green-200">
              <p className="text-xs text-gray-500 mb-1">Bank Name</p>
              <p className="text-sm font-semibold text-gray-800">{verificationStatus.data.bankName || 'N/A'}</p>
            </div>
            {verificationStatus.data.branch && (
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-xs text-gray-500 mb-1">Branch</p>
                <p className="text-sm font-semibold text-gray-800">{verificationStatus.data.branch}</p>
              </div>
            )}
            {verificationStatus.data.city && (
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-xs text-gray-500 mb-1">City</p>
                <p className="text-sm font-semibold text-gray-800">{verificationStatus.data.city}, {verificationStatus.data.state}</p>
              </div>
            )}
          </div>

          {/* Payment Methods Support */}
          {(verificationStatus.data.impsEnabled || verificationStatus.data.neftEnabled || 
            verificationStatus.data.rtgsEnabled || verificationStatus.data.upiEnabled) && (
            <div className="mt-4 p-3 bg-white rounded border border-green-200">
              <p className="text-xs text-gray-500 mb-2">Payment Methods Supported</p>
              <div className="flex flex-wrap gap-2">
                {verificationStatus.data.impsEnabled && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">IMPS</span>
                )}
                {verificationStatus.data.neftEnabled && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">NEFT</span>
                )}
                {verificationStatus.data.rtgsEnabled && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">RTGS</span>
                )}
                {verificationStatus.data.upiEnabled && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">UPI</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Verification form
  return (
    <div className="space-y-4">
      <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-full">
            <Building2 className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-800">Verify Your Bank Account</h3>
            <p className="text-xs text-gray-600 mt-1">
              Enter your bank account details to verify instantly with live bank records
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
          {/* Account Number Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={handleAccountNumberChange}
              onKeyPress={handleKeyPress}
              placeholder="123456789012"
              className={`w-full px-4 py-3 border rounded-lg text-base font-mono transition-all duration-300 ${
                error 
                  ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-2 focus:ring-purple-500'
              } focus:outline-none`}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your bank account number (9-18 digits)
            </p>
          </div>

          {/* IFSC Code Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IFSC Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={ifsc}
              onChange={handleIFSCChange}
              onKeyPress={handleKeyPress}
              placeholder="SBIN0001234"
              maxLength={11}
              className={`w-full px-4 py-3 border rounded-lg text-base font-mono uppercase transition-all duration-300 ${
                error 
                  ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-2 focus:ring-purple-500'
              } focus:outline-none`}
              disabled={loading}
            />
            
            <div className="flex items-center gap-2 mt-2">
              <div className={`h-1 flex-1 rounded ${ifsc.length >= 4 ? 'bg-purple-500' : 'bg-gray-200'}`} />
              <div className={`h-1 flex-1 rounded ${ifsc.length >= 8 ? 'bg-purple-500' : 'bg-gray-200'}`} />
              <div className={`h-1 flex-1 rounded ${ifsc.length === 11 ? 'bg-purple-500' : 'bg-gray-200'}`} />
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              {ifsc.length}/11 characters • Format: 4 letters + 0 + 6 alphanumeric
            </p>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || accountNumber.length < 9 || ifsc.length !== 11}
            className={`w-full px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center gap-2 ${
              loading || accountNumber.length < 9 || ifsc.length !== 11
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 hover:scale-105 hover:shadow-lg'
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
                <span>Verify Bank Account</span>
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
              <p className="font-semibold mb-1">Why verify bank account?</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-600">
                <li>Instant verification with live bank records</li>
                <li>Confirms account exists and is active</li>
                <li>Secure salary transfer setup</li>
                <li>Check supported payment methods (IMPS, NEFT, RTGS, UPI)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sandbox Test Accounts Info - Remove in production */}
        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-purple-700">
              <p className="font-semibold mb-1">Test Accounts (Sandbox Only):</p>
              <div className="space-y-1 text-purple-600">
                <p>• <span className="font-mono">919010015323374</span> / <span className="font-mono">UTIB0002381</span> ✅</p>
                <p>• <span className="font-mono">003493618712</span> / <span className="font-mono">KKBK0000146</span> ✅</p>
                <p className="text-purple-500 text-[10px] mt-1">Use these accounts for testing. Remove this box in production.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankVerification;
