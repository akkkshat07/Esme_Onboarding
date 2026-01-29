

export const sendOtp = async (mobileNumber) => {

  console.log(`OTP would be sent to ${mobileNumber}`);
  return { success: true, message: 'OTP sent' };
};

export const verifyOtp = async (mobileNumber, otp) => {

  if (/^\d{6}$/.test(otp)) {
    return { success: true, message: 'OTP verified' };
  }
  return { success: false, message: 'Invalid OTP' };
};

export const resendOtp = async (mobileNumber) => {

  console.log(`OTP would be resent to ${mobileNumber}`);
  return { success: true, message: 'OTP resent' };
};
