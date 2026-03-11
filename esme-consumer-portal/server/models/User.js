import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: {
    type: String,
    required: function () {
      return this.role === 'candidate';
    },
    sparse: true
  },
  password: { type: String, required: true },
  role: { type: String, enum: ['candidate', 'admin', 'super_admin'], default: 'candidate' },
  status: { type: String, enum: ['pending', 'submitted', 'completed', 'approved', 'rejected'], default: 'pending' },
  isLocked: { type: Boolean, default: false },

  profileData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  driveFolder: {
    folderId: String,
    folderName: String,
    uploadedSubfolderId: String,
    generatedSubfolderId: String
  },
  documents: [{
    type: { type: String },
    fileName: String,
    localUrl: String,
    driveFileId: String,
    driveViewLink: String,
    driveDownloadLink: String,
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  // Aadhaar Verification via DigiLocker
  aadhaarVerification: {
    isVerified: { type: Boolean, default: false },
    clientId: String,
    verifiedAt: Date,
    fullName: String,
    fatherName: String,
    dob: String,
    gender: String,
    maskedAadhaar: String,
    fullAddress: String,
    address: {
      country: String,
      state: String,
      dist: String,
      subdist: String,
      po: String,
      vtc: String,
      house: String,
      street: String,
      loc: String,
      landmark: String,
      zip: String
    },
    profileImage: String, // Base64 encoded image
    xmlUrl: String
  },

  // PAN Verification via SurePass PAN v3 API
  panVerification: {
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    panNumber: String,
    fullName: String,
    firstName: String,
    middleName: String,
    lastName: String,
    // v3 specific fields
    dob: String, // Date of birth in YYYY-MM-DD format
    gender: String, // M/F/O
    status: String, // valid/invalid
    aadhaarLinked: Boolean,
    maskedAadhaar: String, // Masked Aadhaar number
    // Additional fields
    category: String, // Individual, Company, etc.
    aadhaarSeedingStatus: String,
    lastUpdated: String
  },

  // Bank Account Verification via SurePass Bank Verification API
  bankVerification: {
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    accountNumber: String,
    ifsc: String,
    accountExists: Boolean,
    fullName: String,
    upiId: String,
    impsRefNo: String,
    remarks: String,
    status: String, // success, invalid_ifsc, invalid_account, etc.
    // Bank/Branch Details
    bankName: String,
    branch: String,
    city: String,
    state: String,
    address: String,
    contact: String,
    micr: String,
    // Payment Methods
    impsEnabled: Boolean,
    rtgsEnabled: Boolean,
    neftEnabled: Boolean,
    upiEnabled: Boolean,
    lastUpdated: String
  },

  signature: {
    signatureImage: String,
    location: String,
    signedDate: Date,
    savedAt: Date,
    isSaved: { type: Boolean, default: false }
  },

  generatedDocuments: {
    joiningForm: {
      fileId: String,
      fileName: String,
      viewLink: String,
      downloadLink: String,
      generatedAt: Date
    },
    medicalForm: {
      fileId: String,
      fileName: String,
      viewLink: String,
      downloadLink: String,
      generatedAt: Date
    },
    selfDeclaration: {
      fileId: String,
      fileName: String,
      viewLink: String,
      downloadLink: String,
      generatedAt: Date
    },
    form11: {
      fileId: String,
      fileName: String,
      viewLink: String,
      downloadLink: String,
      generatedAt: Date
    },
    formF: {
      fileId: String,
      fileName: String,
      viewLink: String,
      downloadLink: String,
      generatedAt: Date
    },
    pfNomination: {
      fileId: String,
      fileName: String,
      viewLink: String,
      downloadLink: String,
      generatedAt: Date
    },
    policyAcknowledgment: {
      fileId: String,
      fileName: String,
      viewLink: String,
      downloadLink: String,
      generatedAt: Date
    },
    checklist: {
      fileId: String,
      fileName: String,
      viewLink: String,
      downloadLink: String,
      generatedAt: Date
    }
  }
}, { timestamps: true });


userSchema.index({ name: 'text', email: 'text', mobile: 'text' });

export default mongoose.model('User', userSchema);
