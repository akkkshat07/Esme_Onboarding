import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['candidate', 'admin', 'super_admin'], default: 'candidate' },
  status: { type: String, enum: ['pending', 'submitted', 'completed', 'approved', 'rejected'], default: 'pending' },
  isLocked: { type: Boolean, default: false }, // When true, candidate cannot edit/upload
  // Use Mixed type for profileData to allow any fields - form data, signatures, etc.
  profileData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Google Drive folder info
  driveFolder: {
    folderId: String,
    folderName: String,
    folderLink: String
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
  }]
}, { timestamps: true });

// Add basic search index
userSchema.index({ name: 'text', email: 'text', mobile: 'text' });

export default mongoose.model('User', userSchema);
