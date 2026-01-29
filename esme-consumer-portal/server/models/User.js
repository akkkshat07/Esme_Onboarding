import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
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


userSchema.index({ name: 'text', email: 'text', mobile: 'text' });

export default mongoose.model('User', userSchema);
