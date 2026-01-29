

export const verifyAadhaar = async (aadhaarNumber) => {

  if (/^\d{12}$/.test(aadhaarNumber)) {
    return {
      success: true,
      message: 'Aadhaar verified',
      data: {
        aadhaarNumber: aadhaarNumber,
        verified: true
      }
    };
  }
  return {
    success: false,
    message: 'Invalid Aadhaar number'
  };
};

export const getAadhaarData = async (aadhaarNumber, otp) => {

  return {
    success: true,
    data: {
      aadhaarNumber: aadhaarNumber,
      name: 'Verified User',
      dob: 'XX-XX-XXXX',
      gender: 'M',
      address: 'Hidden for privacy'
    }
  };
};

export const validateAadhaarNumber = (aadhaarNumber) => {
  return /^\d{12}$/.test(aadhaarNumber);
};

export const storeAadhaarData = async (aadhaarNumber, data) => {

  return { success: true };
};

export const getAadhaarDetails = async (aadhaarNumber) => {

  return {
    success: true,
    data: {
      aadhaarNumber: aadhaarNumber,
      lastVerified: new Date()
    }
  };
};
