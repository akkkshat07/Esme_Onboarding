// MSG91 OTP Service (Stub)

export const sendOtp = async (mobileNumber) => {
  // Stub implementation - in production, integrate with MSG91 API
  console.log(`OTP would be sent to ${mobileNumber}`);
  return { success: true, message: 'OTP sent' };
};

export const verifyOtp = async (mobileNumber, otp) => {
  // Stub implementation - accept any 6-digit OTP
  if (/^\d{6}$/.test(otp)) {
    return { success: true, message: 'OTP verified' };
  }
  return { success: false, message: 'Invalid OTP' };
};

export const resendOtp = async (mobileNumber) => {
  // Stub implementation
  console.log(`OTP would be resent to ${mobileNumber}`);
  return { success: true, message: 'OTP resent' };
};
