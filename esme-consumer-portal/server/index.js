import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import { appendToSheet } from './services/googleSheets.js';
import { appendToSheet as appendToGoogleSheet, updateSheetStatus } from './services/bgvGoogleSheets.js';
import {
  hasValidToken,
  createCandidateFolder,
  createSubfolder,
  uploadFileToDrive,
  uploadOrReplacePdf,
  listFolderFiles,
  downloadFileFromDrive,
  getDriveStatus
} from './services/googleDrive.js';
import { isWhitelisted, refreshWhitelist, getWhitelistStats } from './services/candidateWhitelist.js';
import { sendOtp, verifyOtp, resendOtp } from './services/msg91Otp.js';
import { validateAadhaarNumber, storeAadhaarData, getAadhaarDetails } from './services/aadhaarVerification.js';
import { initializeDigiLocker, downloadAadhaarData, isConfigured as isSurePassConfigured, getConfigStatus } from './services/aadhaarSurePass.js';
import { verifyPAN, isConfigured as isPANConfigured, getConfigStatus as getPANConfigStatus } from './services/panSurePass.js';
import { verifyBankAccount, isConfigured as isBankConfigured, getConfigStatus as getBankConfigStatus } from './services/bankSurePass.js';
import {
  initializeESign,
  verifyESignStatus,
  downloadSignedDocument,
  isESignConfigured,
  getESignConfigStatus
} from './services/esignSurePass.js';
import { generateAndUploadAllPdfs } from './services/generateAndUploadPdfs.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();


const FILE_SIZE_LIMITS = {
  image: 2 * 1024 * 1024,
  pdf: 5 * 1024 * 1024,
  default: 5 * 1024 * 1024
};


const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png'
];


const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: FILE_SIZE_LIMITS.default
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'), false);
    }
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/esme_onboarding')
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

const createSuperAdmin = async () => {
  const adminEmail = 'admin@esmeconsumer.in';
  const admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    await User.create({
      name: 'HR Super Admin',
      email: adminEmail,
      mobile: '9876543210',
      password: 'Esme@consumer2019',
      role: 'super_admin'
    });
    console.log(`✨ Default super admin created (${adminEmail})`);
  } else if (admin.role !== 'super_admin') {

    await User.findByIdAndUpdate(admin._id, { role: 'super_admin' });
    console.log(`✨ Upgraded ${adminEmail} to super admin`);
  }
};
createSuperAdmin();

const otpStore = new Map();

app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;


    const whitelistCheck = await isWhitelisted(mobile, email);
    if (!whitelistCheck.allowed) {
      return res.status(403).json({
        message: whitelistCheck.reason || 'You are not authorized to sign up. Please contact HR.',
        code: 'NOT_WHITELISTED'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ $or: [{ email: normalizedEmail }, { mobile }] });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ name, email: normalizedEmail, mobile, password });
    await user.save();

    console.log(`✅ New signup: ${name} (${normalizedEmail}) - Matched by ${whitelistCheck.matchedBy}`);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, mobile, password } = req.body;
    let query = { password };

    if (email) {
      query.email = email.trim().toLowerCase();
    } else if (mobile) {
      query.mobile = mobile;
    } else {
      return res.status(400).json({ message: 'Email or Mobile required' });
    }

    const user = await User.findOne(query);

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });


    if (user.role !== 'admin' && user.role !== 'super_admin') {
      const whitelistCheck = await isWhitelisted(user.mobile, user.email);
      if (!whitelistCheck.allowed) {
        return res.status(403).json({
          message: 'Your access has been revoked. Please contact HR.',
          code: 'NOT_WHITELISTED'
        });
      }
    }

    res.json({
      token: `mock-jwt-${user._id}`,
      user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.post('/api/admin/refresh-whitelist', async (req, res) => {
  try {
    const stats = await refreshWhitelist();
    if (!stats) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch whitelist data. Check Google Sheets credentials.'
      });
    }
    res.json({ success: true, count: stats.length || 0, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/admin/whitelist', async (req, res) => {
  try {
    const { getWhitelistCandidates } = await import('./services/candidateWhitelist.js');
    const whitelist = await getWhitelistCandidates();
    res.json({ success: true, whitelist: whitelist || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, whitelist: [] });
  }
});

app.get('/api/admin/whitelist-stats', async (req, res) => {
  try {
    const stats = await getWhitelistStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await User.find({ role: 'candidate' });
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/candidates/:id', async (req, res) => {
  try {
    const candidate = await User.findById(req.params.id);
    if (!candidate || candidate.role !== 'candidate') {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/candidate/:email', async (req, res) => {
  try {
    const candidate = await User.findOne({ email: req.params.email, role: 'candidate' });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/save-profile', async (req, res) => {
  try {
    const { email, ...profileData } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    let driveFolder = existingUser.driveFolder;
    let uploadedSubfolderId = existingUser.driveFolder?.uploadedSubfolderId;
    let generatedSubfolderId = existingUser.driveFolder?.generatedSubfolderId;

    if (hasValidToken() && !driveFolder?.folderId) {
      try {
        const candidateName = profileData.fullName || existingUser.name;
        const department = profileData.department || profileData.profession || 'New Joiner';
        const city = profileData.currentCity || 'Unspecified';

        driveFolder = await createCandidateFolder(candidateName, department, city);
        console.log(`📁 Created Google Drive folder for ${candidateName}`);

        const uploadedFolder = await createSubfolder(driveFolder.folderId, 'uploaded');
        uploadedSubfolderId = uploadedFolder.folderId;

        console.log(`📁 Created 'uploaded' subfolder`);
      } catch (folderError) {
        console.error('⚠️ Could not create Drive folder:', folderError.message);
      }
    }

    const updateData = {
      profileData,
      status: 'completed',
      ...(driveFolder && {
        driveFolder: {
          ...driveFolder,
          uploadedSubfolderId,
          generatedSubfolderId
        }
      })
    };

    const user = await User.findOneAndUpdate(
      { email },
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      driveFolder: driveFolder || null
    });
  } catch (err) {
    console.error('❌ Save profile error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Generate all forms for a candidate
app.post('/api/candidates/:id/generate-forms', async (req, res) => {
  try {
    const candidate = await User.findById(req.params.id);
    if (!candidate || candidate.role !== 'candidate') {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    console.log(`📄 Manually generating all forms for: ${candidate.name}`);

    // Check if Drive is available (either Service Account or OAuth)
    const driveStatus = await getDriveStatus();
    if (!driveStatus.connected) {
      return res.status(503).json({ message: 'Google Drive not connected. Please configure Google Drive first.' });
    }

    const pdfResult = await generateAndUploadAllPdfs(candidate);

    await User.findByIdAndUpdate(candidate._id, {
      'driveFolder.generatedSubfolderId': pdfResult.generatedSubfolderId,
      'generatedDocuments': pdfResult.generatedDocuments
    });

    console.log('✅ All forms generated and uploaded successfully');

    res.json({
      success: true,
      message: 'All forms generated successfully',
      generatedDocuments: pdfResult.generatedDocuments
    });
  } catch (err) {
    console.error('❌ Error generating forms:', err.message);
    res.status(500).json({ message: 'Failed to generate forms: ' + err.message });
  }
});

app.get('/api/candidates/:id/download-zip', async (req, res) => {
  try {
    const candidate = await User.findById(req.params.id);
    if (!candidate || candidate.role !== 'candidate') {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    console.log(`\n📦 ZIP Download Request for: ${candidate.name} (${candidate._id})`);
    console.log(`📄 Documents array length: ${candidate.documents?.length || 0}`);
    console.log(`📋 Generated documents: ${candidate.generatedDocuments ? Object.keys(candidate.generatedDocuments).length : 0}`);

    const candidateName = (candidate.profileData?.fullName || candidate.name).replace(/[^a-zA-Z0-9]/g, '_');
    const submissionDate = candidate.createdAt ? new Date(candidate.createdAt).toISOString().split('T')[0] : 'unknown';
    const zipFileName = `${candidateName}_${submissionDate}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    let filesAdded = 0;

    archive.on('error', (err) => {
      console.error('Archive error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error creating ZIP file: ' + err.message });
      }
    });

    archive.pipe(res);

    // Add uploaded files (both Drive and local)
    if (candidate.documents && candidate.documents.length > 0) {
      console.log(`\n📦 Processing ${candidate.documents.length} uploaded files...`);
      for (const doc of candidate.documents) {
        console.log(`\n  Processing: ${doc.fileName || doc.type}`);
        console.log(`    - driveFileId: ${doc.driveFileId || 'none'}`);
        console.log(`    - localUrl: ${doc.localUrl || 'none'}`);

        try {
          let fileBuffer;

          // Try Google Drive first
          if (doc.driveFileId && hasValidToken()) {
            try {
              fileBuffer = await downloadFileFromDrive(doc.driveFileId);
              console.log(`    ✅ Downloaded from Drive`);
            } catch (driveError) {
              console.log(`    ⚠️ Drive download failed: ${driveError.message}`);
            }
          }

          // Fallback to local file if Drive failed or not available
          if (!fileBuffer && doc.localUrl) {
            const localPath = path.join(__dirname, doc.localUrl.replace(/^\//, ''));
            console.log(`    Trying local path: ${localPath}`);
            if (fs.existsSync(localPath)) {
              fileBuffer = fs.readFileSync(localPath);
              console.log(`    ✅ Read from local storage`);
            } else {
              console.log(`    ❌ Local file not found`);
            }
          }

          if (fileBuffer) {
            archive.append(fileBuffer, { name: `uploaded/${doc.fileName || doc.type}` });
            filesAdded++;
            console.log(`    ✅ Added to ZIP`);
          } else {
            console.error(`    ❌ Could not find file anywhere`);
          }
        } catch (error) {
          console.error(`    ❌ Error: ${error.message}`);
        }
      }
    } else {
      console.log('⚠️  No uploaded documents found in database');
    }

    // Add generated files (both Drive and local)
    if (candidate.generatedDocuments) {
      const docKeys = ['joiningForm', 'medicalForm', 'selfDeclaration', 'form11', 'formF', 'pfNomination', 'policyAcknowledgment', 'checklist'];
      console.log(`\n📦 Processing generated documents...`);

      for (const key of docKeys) {
        const doc = candidate.generatedDocuments[key];
        if (doc) {
          console.log(`\n  Processing: ${key}`);
          console.log(`    - fileId: ${doc.fileId || 'none'}`);
          console.log(`    - viewLink: ${doc.viewLink || 'none'}`);
          console.log(`    - downloadLink: ${doc.downloadLink || 'none'}`);

          try {
            let fileBuffer;

            // Try Google Drive first
            if (doc.fileId && hasValidToken()) {
              try {
                fileBuffer = await downloadFileFromDrive(doc.fileId);
                console.log(`    ✅ Downloaded from Drive`);
              } catch (driveError) {
                console.log(`    ⚠️ Drive download failed: ${driveError.message}`);
              }
            }

            // Fallback to viewLink/downloadLink if available
            if (!fileBuffer && (doc.viewLink || doc.downloadLink)) {
              const linkToTry = doc.downloadLink || doc.viewLink;
              const localPath = path.join(__dirname, linkToTry.replace(/^\//, ''));
              console.log(`    Trying local path: ${localPath}`);
              if (fs.existsSync(localPath)) {
                fileBuffer = fs.readFileSync(localPath);
                console.log(`    ✅ Read from local storage`);
              } else {
                console.log(`    ❌ Local file not found`);
              }
            }

            if (fileBuffer) {
              archive.append(fileBuffer, { name: `generated/${doc.fileName || key + '.pdf'}` });
              filesAdded++;
              console.log(`    ✅ Added to ZIP`);
            } else {
              console.error(`    ❌ Could not find file anywhere`);
            }
          } catch (error) {
            console.error(`    ❌ Error: ${error.message}`);
          }
        }
      }
    } else {
      console.log('⚠️  No generated documents found in database');
    }

    console.log(`\n📊 Summary: ${filesAdded} files added to ZIP\n`);

    if (filesAdded === 0) {
      console.error('❌ No files were added to ZIP - aborting');
      archive.abort();
      if (!res.headersSent) {
        return res.status(404).json({ message: 'No documents found for this candidate' });
      }
    } else {
      console.log(`✅ Total files added to ZIP: ${filesAdded}`);
    }

    archive.finalize();
  } catch (err) {
    console.error('ZIP download error:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error creating ZIP file: ' + err.message });
    }
  }
});

const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'File too large. Maximum size is 5MB.',
          code: 'FILE_TOO_LARGE'
        });
      }
      if (err.message.includes('Invalid file type')) {
        return res.status(400).json({
          message: err.message,
          code: 'INVALID_FILE_TYPE'
        });
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

app.post('/api/upload', handleUpload, async (req, res) => {
  try {
    const { email, type } = req.body;
    if (!email || !type || !req.file) {
      return res.status(400).json({ success: false, message: 'Missing required data (email, type, or file)' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isLocked) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ success: false, message: 'Your profile is locked. Please contact HR to make changes.' });
    }

    const candidateName = (user.profileData?.fullName || user.name).replace(/\s+/g, '_');
    const role = user.role;
    console.log(`📤 Uploading ${type} for ${user.name}`);

    const formattedFileName = `${type}_${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
    let documentRecord = null;

    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        const driveFolder = user.driveFolder;
        const driveFile = await uploadFileToDrive(
          driveFolder?.uploadedSubfolderId || driveFolder?.folderId || null,
          req.file.path,
          formattedFileName,
          req.file.mimetype
        );
        console.log(`✅ Uploaded to Drive: ${driveFile.fileName}`);

        if (req.file?.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        documentRecord = {
          type,
          fileName: formattedFileName,
          driveFileId: driveFile.fileId,
          driveViewLink: driveFile.viewLink,
          driveDownloadLink: driveFile.downloadLink,
          uploadedAt: new Date()
        };
      } catch (driveError) {
        console.error('⚠️ Drive upload failed:', driveError.message);
      }
    }

    if (!documentRecord) {
      console.log('📁 Using local storage fallback...');
      const candidateFolderPath = path.join(__dirname, 'uploads', `${candidateName}_${role}`);
      if (!fs.existsSync(candidateFolderPath)) {
        fs.mkdirSync(candidateFolderPath, { recursive: true });
      }
      const newFilePath = path.join(candidateFolderPath, formattedFileName);
      fs.renameSync(req.file.path, newFilePath);

      documentRecord = {
        type,
        fileName: formattedFileName,
        localUrl: `/uploads/${candidateName}_${role}/${formattedFileName}`,
        uploadedAt: new Date()
      };
    }

    // ROBUST SAVE: Manual array update to ensure database persistence
    const normalizedEmail = email.trim().toLowerCase();
    console.log(`📂 Attempting to save document for ${normalizedEmail} (Type: ${type})`);

    // Find fresh user
    const dbUser = await User.findOne({ email: normalizedEmail });
    if (!dbUser) throw new Error('User lost during upload process');

    // Filter out old docs of same type and add new one
    const docsBefore = dbUser.documents?.length || 0;
    dbUser.documents = (dbUser.documents || []).filter(d => d.type !== type);
    dbUser.documents.push(documentRecord);

    // Save
    const savedUser = await dbUser.save();
    console.log(`✅ DB Save Complete. Docs: ${docsBefore} -> ${savedUser.documents.length}`);

    // LOG TO FILE FOR AGENT VISIBILITY
    const logMsg = `[${new Date().toISOString()}] UPLOAD SUCCESS: ${email} | Type: ${type} | New Count: ${savedUser.documents.length}\n`;
    fs.appendFileSync(path.join(__dirname, 'upload_debug.log'), logMsg);

    res.json({
      success: true,
      document: documentRecord,
      totalDocuments: savedUser.documents.length
    });
  } catch (err) {
    console.error('❌ Upload error:', err.message);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// Upload generated PDF to Google Drive
app.post('/api/upload-pdf-to-drive', async (req, res) => {
  try {
    const { email, pdfBase64, formName, fileName } = req.body;

    if (!email || !pdfBase64 || !formName) {
      return res.status(400).json({ message: 'Missing required fields: email, pdfBase64, formName' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`📄 Uploading generated PDF: ${formName} for ${user.name}`);

    // Check if Google Drive is connected
    if (!hasValidToken()) {
      return res.status(400).json({ message: 'Google Drive not connected' });
    }

    let driveFolder = user.driveFolder;

    // Create candidate folder if doesn't exist
    if (!driveFolder?.folderId) {
      driveFolder = await createCandidateFolder(
        user.name,
        user.profileData?.profession || 'New Joiner',
        user.profileData?.currentCity || 'Unspecified'
      );
      await User.findByIdAndUpdate(user._id, { driveFolder });
      console.log(`📁 Created Drive folder for ${user.name}`);
    }

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    // Generate proper filename
    const candidateName = user.name.replace(/\s+/g, '_');
    const role = (user.profileData?.profession || 'New_Joiner').replace(/\s+/g, '_');
    const finalFileName = fileName || `${formName}_${candidateName}_${role}.pdf`;

    // Delete existing file with same name if exists (for updates)
    try {
      const deleted = await findAndDeleteFile(driveFolder.folderId, formName);
      if (deleted) {
        console.log(`🗑️ Deleted old version of ${formName}`);
      }
    } catch (deleteErr) {
      console.log('⚠️ No existing file to delete or error:', deleteErr.message);
    }

    // Upload the PDF buffer to Drive
    const driveFile = await uploadBufferToDrive(
      driveFolder.folderId,
      pdfBuffer,
      finalFileName,
      'application/pdf'
    );

    console.log(`✅ Uploaded to Drive: ${driveFile.fileName}`);

    // Create document record
    const documentRecord = {
      type: formName,
      fileName: finalFileName,
      driveFileId: driveFile.fileId,
      driveViewLink: driveFile.viewLink,
      driveDownloadLink: driveFile.downloadLink,
      uploadedAt: new Date()
    };

    // Check if this form type already exists and update, otherwise add
    const existingDocIndex = user.documents?.findIndex(d => d.type === formName);
    if (existingDocIndex >= 0) {
      // Update existing document record
      await User.findOneAndUpdate(
        { email, 'documents.type': formName },
        { $set: { 'documents.$': documentRecord } }
      );
    } else {
      // Add new document record
      await User.findOneAndUpdate(
        { email },
        { $push: { documents: documentRecord } }
      );
    }

    res.json({
      success: true,
      document: documentRecord
    });
  } catch (err) {
    console.error('❌ PDF upload error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Consolidated duplicate route removed.

app.patch('/api/candidates/:id/profile', async (req, res) => {
  try {
    const { profileData } = req.body;
    const candidate = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { profileData } },
      { new: true }
    );
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/candidates/:id/status', async (req, res) => {
  try {
    const { status, department, employeeId, hrRemarks, designation, rejectionReason, approvedBy, rejectedBy, approvedAt, rejectedAt } = req.body;


    const updateData = { status };


    if (department) {
      updateData['profileData.department'] = department;
      updateData.department = department;
    }


    if (employeeId !== undefined) {
      updateData.employeeId = employeeId;
    }


    if (hrRemarks !== undefined) {
      updateData.hrRemarks = hrRemarks;
    }


    if (designation !== undefined) {
      updateData.designation = designation;
      updateData['profileData.profession'] = designation;
    }


    if (status === 'approved') {
      updateData.approvedAt = approvedAt || new Date();
      updateData.hrVerified = true;
      if (approvedBy) updateData.approvedBy = approvedBy;
    }


    if (status === 'rejected') {
      updateData.rejectedAt = rejectedAt || new Date();
      if (rejectedBy) updateData.rejectedBy = rejectedBy;
      if (rejectionReason) updateData.rejectionReason = rejectionReason;
    }

    const candidate = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    console.log(`✅ Updated ${candidate.name}: status=${status}${department ? `, department=${department}` : ''}${employeeId ? `, empId=${employeeId}` : ''}${designation ? `, designation=${designation}` : ''}`);
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.delete('/api/candidates/:id', async (req, res) => {
  try {
    const candidate = await User.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }


    await User.findByIdAndDelete(req.params.id);

    console.log(`🗑️ Deleted candidate: ${candidate.name} (${candidate.email})`);
    res.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (err) {
    console.error('❌ Delete error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/candidates', async (req, res) => {
  try {
    console.log('📝 Received candidate data:', req.body);

    const existingCandidate = await User.findOne({ email: req.body.email });


    const newStatus = req.body.status || 'pending';

    const shouldLock = newStatus === 'submitted';

    let candidate;
    if (existingCandidate) {
      candidate = await User.findOneAndUpdate(
        { email: req.body.email },
        {
          name: req.body.name,
          mobile: req.body.mobile,
          profileData: req.body.profileData,
          status: newStatus,
          ...(shouldLock && { isLocked: true, submittedAt: new Date() })
        },
        { new: true }
      );
      console.log('✅ Candidate profile updated:', candidate._id, 'Status:', newStatus, 'Locked:', shouldLock);
    } else {
      candidate = new User({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        password: req.body.mobile,
        profileData: req.body.profileData,
        status: newStatus,
        isLocked: shouldLock,
        ...(shouldLock && { submittedAt: new Date() })
      });
      await candidate.save();
      console.log('✅ Candidate saved to DB:', candidate._id, 'Status:', newStatus, 'Locked:', shouldLock);
    }

    if (shouldLock && hasValidToken()) {
      try {
        console.log('📄 Generating and uploading PDFs to Google Drive...');
        const pdfResult = await generateAndUploadAllPdfs(candidate);

        await User.findByIdAndUpdate(candidate._id, {
          'driveFolder.generatedSubfolderId': pdfResult.generatedSubfolderId,
          'generatedDocuments': pdfResult.generatedDocuments
        });

        console.log('✅ All PDFs generated and uploaded to Google Drive');
      } catch (pdfError) {
        console.error('❌ Error generating PDFs:', pdfError.message);
      }
    }

    try {
      console.log('� BGV Sheet Sync - Candidate Data:');
      console.log('  - Name:', candidate.name);
      console.log('  - Email:', candidate.email);
      console.log('  - Mobile:', candidate.mobile);
      console.log('  - ProfileData keys:', Object.keys(candidate.profileData || {}));
      console.log('  - Has joiningFormData:', !!candidate.profileData?.joiningFormData);
      console.log('  - Has formFData:', !!candidate.profileData?.formFData);
      console.log('  - ProfileData.fullName:', candidate.profileData?.fullName);
      console.log('  - ProfileData.mobileNumber:', candidate.profileData?.mobileNumber);
      console.log('  - ProfileData.aadhaarNumber:', candidate.profileData?.aadhaarNumber);
      console.log('  - ProfileData.fatherName:', candidate.profileData?.fatherName);
      console.log('  - ProfileData.dateOfBirth:', candidate.profileData?.dateOfBirth);

      await appendToGoogleSheet('BGV', candidate);
      console.log('✅ BGV sheet synced successfully');
    } catch (sheetError) {
      console.error('⚠️  BGV sheet sync error:', sheetError.message);
      console.error('⚠️  Full error:', sheetError);
    }

    res.status(201).json(candidate);
  } catch (error) {
    console.error('❌ Error saving candidate:', error.message);
    res.status(500).json({ error: error.message });
  }
});


app.patch('/api/candidates/:id/lock', async (req, res) => {
  try {
    const { isLocked } = req.body;
    const candidate = await User.findByIdAndUpdate(
      req.params.id,
      { isLocked },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    console.log(`🔒 Candidate ${candidate.name} ${isLocked ? 'locked' : 'unlocked'}`);
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/candidates/:id/bgv-status', async (req, res) => {
  try {
    const { bgvStatus } = req.body;
    const candidate = await User.findByIdAndUpdate(
      req.params.id,
      { bgvStatus },
      { new: true }
    );

    try {
      await updateSheetStatus('BGV', candidate.name, bgvStatus);
    } catch (sheetError) {
      console.error('BGV sheet update error:', sheetError.message);
    }

    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/candidates/:id/payroll-sync', async (req, res) => {
  try {
    const candidate = await User.findById(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    try {
      await appendToGoogleSheet('PAYROLL', candidate);
      res.json({ message: 'Synced to PAYROLL sheet' });
    } catch (sheetError) {
      console.error('PAYROLL sheet sync error:', sheetError.message);
      throw sheetError;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/candidates/:id/attendance-sync', async (req, res) => {
  try {
    const candidate = await User.findById(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    try {
      await appendToGoogleSheet('ATTENDANCE', candidate);
      res.json({ message: 'Synced to ATTENDANCE sheet' });
    } catch (sheetError) {
      console.error('ATTENDANCE sheet sync error:', sheetError.message);
      throw sheetError;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/test-sync/:email', async (req, res) => {
  try {
    const candidate = await User.findOne({ email: req.params.email });
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    console.log('🔄 Manual sync for:', candidate.name);
    console.log('📱 Mobile:', candidate.mobile);
    console.log('📱 profileData.mobileNumber:', candidate.profileData?.mobileNumber);

    await appendToGoogleSheet('BGV', candidate);
    res.json({ success: true, message: 'Synced to Google Sheet', mobile: candidate.mobile });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: error.message });
  }
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Google Drive Status endpoint (Service Account)
app.get('/api/auth/google/status', async (req, res) => {
  try {
    const status = await getDriveStatus();
    res.json(status);
  } catch (error) {
    res.json({ connected: false, message: error.message });
  }
});

// Service Account doesn't need OAuth endpoints
// No browser login required - credentials are in .env file



// ============================================
// Admin Management Endpoints
// ============================================

app.get('/api/admin/admins', async (req, res) => {
  try {
    const { userId } = req.query;
    const requestingUser = await User.findById(userId);

    if (!requestingUser || (requestingUser.role !== 'super_admin' && requestingUser.role !== 'admin')) {
      return res.status(403).json({ message: 'Access denied. Admin access required.' });
    }

    const admins = await User.find({
      role: { $in: ['admin', 'super_admin'] }
    }).select('-password').sort({ createdAt: -1 });

    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.post('/api/admin/create-admin', async (req, res) => {
  try {
    const { name, email, mobile, password, creatorId } = req.body;


    const creator = await User.findById(creatorId);
    if (!creator || creator.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }


    // Check for existing user by email, and mobile only if provided
    const existingQuery = { email };
    if (mobile) {
      existingQuery.$or = [{ email }, { mobile }];
      delete existingQuery.email;
    }

    const existing = await User.findOne(existingQuery);
    if (existing) {
      return res.status(400).json({ message: 'Admin with this email' + (mobile ? ' or mobile' : '') + ' already exists.' });
    }

    const adminData = {
      name,
      email,
      password,
      role: 'admin',
      createdBy: creatorId
    };

    // Only add mobile if provided
    if (mobile) {
      adminData.mobile = mobile;
    }

    const newAdmin = new User(adminData);

    await newAdmin.save();
    console.log(`✨ New admin created by ${creator.name}: ${name} (${email})`);

    res.json({
      success: true,
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        mobile: newAdmin.mobile,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt
      }
    });
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
    res.status(500).json({ message: err.message });
  }
});


app.delete('/api/admin/admins/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    const requestingUser = await User.findById(userId);

    if (!requestingUser || requestingUser.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }

    const adminToDelete = await User.findById(req.params.id);
    if (!adminToDelete) {
      return res.status(404).json({ message: 'Admin not found.' });
    }


    if (adminToDelete._id.toString() === userId) {
      return res.status(400).json({ message: 'Cannot delete yourself.' });
    }


    if (adminToDelete.role === 'super_admin') {
      return res.status(400).json({ message: 'Cannot delete super admin accounts.' });
    }

    await User.findByIdAndDelete(req.params.id);
    console.log(`🗑️ Admin deleted by ${requestingUser.name}: ${adminToDelete.name}`);

    res.json({ success: true, message: 'Admin deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.post('/api/admin/change-password', async (req, res) => {
  try {
    const { userId, email, currentPassword, newPassword } = req.body;

    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }


    if (user.password !== currentPassword) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }


    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    user.password = newPassword;
    user.lastPasswordChange = new Date();
    await user.save();

    console.log(`🔐 Password changed for ${user.name} (${user.email})`);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/admin/update-profile', async (req, res) => {
  try {
    const { currentEmail, name, email, mobile } = req.body;

    const user = await User.findOne({ email: currentEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (email && email !== currentEmail) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use.' });
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;

    await user.save();

    console.log(`✏️ Profile updated for ${user.name} (${user.email})`);

    res.json({ success: true, message: 'Profile updated successfully.', user: { name: user.name, email: user.email, mobile: user.mobile } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.get('/api/admin/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return res.status(404).json({ message: 'Admin not found.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Candidate Password Change
app.post('/api/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Verify current password
    if (user.password !== currentPassword) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters.' });
    }

    // Update password
    user.password = newPassword;
    user.lastPasswordChange = new Date();
    await user.save();

    console.log(`🔐 Password changed for ${user.name} (${user.email})`);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: err.message });
  }
});






app.post('/api/otp/send', async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: 'Mobile number is required.' });
    }

    const result = await sendOtp(mobile);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.post('/api/otp/verify', async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ message: 'Mobile and OTP are required.' });
    }

    const result = await verifyOtp(mobile, otp);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.post('/api/otp/resend', async (req, res) => {
  try {
    const { mobile, type } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: 'Mobile number is required.' });
    }

    const result = await resendOtp(mobile, type || 'text');

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});






app.post('/api/aadhaar/generate-otp', async (req, res) => {
  try {
    const { aadhaarNumber, email } = req.body;

    if (!aadhaarNumber) {
      return res.status(400).json({ message: 'Aadhaar number is required.' });
    }


    const validation = validateAadhaarNumber(aadhaarNumber);

    if (!validation.success) {
      return res.status(400).json(validation);
    }


    if (email) {
      const user = await User.findOne({ email });
      if (user) {
        const storeResult = await storeAadhaarData(aadhaarNumber, user._id);
        if (storeResult.success) {
          user.profileData = user.profileData || {};
          user.profileData.aadhaarNumber = storeResult.aadhaarNumber;
          await user.save();

          return res.json({
            success: true,
            message: 'Aadhaar number has been saved. Please upload Aadhaar card copy.',
            aadhaarNumber: storeResult.aadhaarNumber,
            maskedAadhaar: storeResult.maskedAadhaar
          });
        }
      }
    }

    res.json({
      success: true,
      message: 'Aadhaar number accepted. Please upload Aadhaar card copy.',
      aadhaarNumber: validation.aadhaarNumber,
      maskedAadhaar: validation.maskedAadhaar
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.post('/api/aadhaar/verify-otp', async (req, res) => {
  try {
    const { aadhaarNumber, email } = req.body;

    if (!aadhaarNumber) {
      return res.status(400).json({ message: 'Aadhaar number is required.' });
    }


    const result = await getAadhaarDetails(aadhaarNumber);

    if (result.success && email) {

      await User.findOneAndUpdate(
        { email },
        {
          aadhaarSubmitted: true,
          profileData: {
            aadhaarNumber: result.aadhaarNumber
          }
        }
      );
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.get('/api/aadhaar/status/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      submitted: user.aadhaarSubmitted || false,
      aadhaarNumber: user.profileData?.aadhaarNumber || null,
      message: user.aadhaarSubmitted ? 'Aadhaar submitted' : 'Aadhaar pending'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================
// AADHAAR VERIFICATION VIA DIGILOCKER (SUREPASS)
// ============================================

/**
 * Check if SurePass DigiLocker is configured
 * GET /api/aadhaar-digilocker/config-status
 */
app.get('/api/aadhaar-digilocker/config-status', async (req, res) => {
  try {
    const status = getConfigStatus();
    res.json(status);
  } catch (error) {
    console.error('Config status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check configuration status'
    });
  }
});

/**
 * Initialize DigiLocker session and get SDK token
 * POST /api/aadhaar-digilocker/initialize
 * Body: { email: string, logoUrl?: string }
 */
app.post('/api/aadhaar-digilocker/initialize', async (req, res) => {
  try {
    const { email, logoUrl } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if SurePass is configured
    if (!isSurePassConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Aadhaar verification service is not configured. Please contact administrator.'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.aadhaarVerification?.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar already verified for this account',
        alreadyVerified: true
      });
    }

    // Initialize DigiLocker session
    const result = await initializeDigiLocker({ logoUrl });

    // Store client_id temporarily for this user
    await User.findOneAndUpdate(
      { email },
      {
        'aadhaarVerification.clientId': result.clientId,
        'aadhaarVerification.tokenExpiry': new Date(Date.now() + (result.expirySeconds * 1000))
      }
    );

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('DigiLocker initialization error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize DigiLocker session'
    });
  }
});

/**
 * Webhook endpoint to receive verification status from SurePass
 * POST /api/aadhaar-digilocker/webhook
 * Body: { client_id: string, status: string, type: string }
 */
app.post('/api/aadhaar-digilocker/webhook', async (req, res) => {
  try {
    const { client_id, status, type } = req.body;

    console.log('📨 DigiLocker Webhook received:', { client_id, status, type });

    if (status === 'success' && type === 'digilocker') {
      // Find user by client_id
      const user = await User.findOne({ 'aadhaarVerification.clientId': client_id });

      if (user) {
        // Download Aadhaar data
        try {
          const aadhaarData = await downloadAadhaarData(client_id);

          // Update user with Aadhaar data
          await User.findByIdAndUpdate(user._id, {
            'aadhaarVerification.isVerified': true,
            'aadhaarVerification.verifiedAt': new Date(),
            'aadhaarVerification.fullName': aadhaarData.aadhaarData.fullName,
            'aadhaarVerification.fatherName': aadhaarData.aadhaarData.fatherName,
            'aadhaarVerification.dob': aadhaarData.aadhaarData.dob,
            'aadhaarVerification.gender': aadhaarData.aadhaarData.gender,
            'aadhaarVerification.maskedAadhaar': aadhaarData.aadhaarData.maskedAadhaar,
            'aadhaarVerification.fullAddress': aadhaarData.aadhaarData.fullAddress,
            'aadhaarVerification.address': aadhaarData.aadhaarData.address,
            'aadhaarVerification.profileImage': aadhaarData.aadhaarData.profileImage,
            'aadhaarVerification.xmlUrl': aadhaarData.xmlUrl
          });

          console.log('✅ Aadhaar verification completed for user:', user.email);
        } catch (downloadError) {
          console.error('Error downloading Aadhaar data from webhook:', downloadError);
        }
      } else {
        console.warn('⚠️ No user found for client_id:', client_id);
      }
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

/**
 * Complete verification - download Aadhaar data after user completes DigiLocker flow
 * POST /api/aadhaar-digilocker/complete
 * Body: { email: string, clientId: string }
 */
app.post('/api/aadhaar-digilocker/complete', async (req, res) => {
  try {
    const { email, clientId } = req.body;

    if (!email || !clientId) {
      return res.status(400).json({
        success: false,
        message: 'Email and clientId are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Download Aadhaar data
    const aadhaarData = await downloadAadhaarData(clientId);

    // Update user with Aadhaar data
    await User.findByIdAndUpdate(user._id, {
      'aadhaarVerification.isVerified': true,
      'aadhaarVerification.clientId': clientId,
      'aadhaarVerification.verifiedAt': new Date(),
      'aadhaarVerification.fullName': aadhaarData.aadhaarData.fullName,
      'aadhaarVerification.fatherName': aadhaarData.aadhaarData.fatherName,
      'aadhaarVerification.dob': aadhaarData.aadhaarData.dob,
      'aadhaarVerification.gender': aadhaarData.aadhaarData.gender,
      'aadhaarVerification.maskedAadhaar': aadhaarData.aadhaarData.maskedAadhaar,
      'aadhaarVerification.fullAddress': aadhaarData.aadhaarData.fullAddress,
      'aadhaarVerification.address': aadhaarData.aadhaarData.address,
      'aadhaarVerification.profileImage': aadhaarData.aadhaarData.profileImage,
      'aadhaarVerification.xmlUrl': aadhaarData.xmlUrl
    });

    res.json({
      success: true,
      message: 'Aadhaar verification completed successfully',
      data: {
        fullName: aadhaarData.aadhaarData.fullName,
        fatherName: aadhaarData.aadhaarData.fatherName,
        dob: aadhaarData.aadhaarData.dob,
        gender: aadhaarData.aadhaarData.gender,
        maskedAadhaar: aadhaarData.aadhaarData.maskedAadhaar,
        fullAddress: aadhaarData.aadhaarData.fullAddress,
        address: aadhaarData.aadhaarData.address,
        profileImage: aadhaarData.aadhaarData.profileImage
      }
    });
  } catch (error) {
    console.error('Complete verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to complete Aadhaar verification'
    });
  }
});

/**
 * Get Aadhaar verification status for a user
 * GET /api/aadhaar-digilocker/status/:email
 */
app.get('/api/aadhaar-digilocker/status/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const verification = user.aadhaarVerification || {};

    res.json({
      success: true,
      isVerified: verification.isVerified || false,
      verifiedAt: verification.verifiedAt,
      data: verification.isVerified ? {
        fullName: verification.fullName,
        fatherName: verification.fatherName,
        dob: verification.dob,
        gender: verification.gender,
        maskedAadhaar: verification.maskedAadhaar,
        fullAddress: verification.fullAddress,
        address: verification.address,
        profileImage: verification.profileImage
      } : null
    });
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get verification status'
    });
  }
});

// ==================== PAN Verification Endpoints (SurePass PAN v3) ====================

/**
 * Check if PAN verification is configured
 * GET /api/pan-verification/config-status
 */
app.get('/api/pan-verification/config-status', (req, res) => {
  try {
    const status = getPANConfigStatus();
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    console.error('PAN config status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check PAN configuration'
    });
  }
});

/**
 * Verify PAN number
 * POST /api/pan-verification/verify
 * Body: { email: string, panNumber: string, fullName: string, dob: string }
 */
app.post('/api/pan-verification/verify', async (req, res) => {
  try {
    const { email, panNumber, fullName, dob } = req.body;

    if (!email || !panNumber || !fullName || !dob) {
      return res.status(400).json({
        success: false,
        message: 'Email, PAN number, full name, and date of birth are required'
      });
    }

    // Validate PAN format (10 alphanumeric characters)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panNumber.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PAN format. Must be 10 characters (e.g., ABCDE1234F)'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified with same PAN
    if (user.panVerification?.isVerified &&
      user.panVerification?.panNumber === panNumber.toUpperCase()) {
      return res.status(400).json({
        success: false,
        message: 'This PAN is already verified for your account',
        alreadyVerified: true,
        data: {
          panNumber: user.panVerification.panNumber,
          fullName: user.panVerification.fullName,
          verifiedAt: user.panVerification.verifiedAt
        }
      });
    }

    console.log(`🔍 Verifying PAN for user: ${email}`);

    // Verify PAN using SurePass API
    const verificationResult = await verifyPAN(panNumber, fullName, dob);

    if (!verificationResult.success) {
      return res.status(422).json(verificationResult);
    }

    // Save verification data to user
    user.panVerification = {
      isVerified: true,
      verifiedAt: new Date(),
      ...verificationResult.data
    };

    await user.save();

    console.log(`✅ PAN verified and saved for user: ${email}`);

    res.json({
      success: true,
      message: 'PAN verified successfully',
      data: verificationResult.data
    });

  } catch (error) {
    console.error('PAN verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify PAN'
    });
  }
});

/**
 * Get PAN verification status
 * GET /api/pan-verification/status/:email
 */
app.get('/api/pan-verification/status/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const verification = user.panVerification || {};

    res.json({
      success: true,
      isVerified: verification.isVerified || false,
      verifiedAt: verification.verifiedAt,
      data: verification.isVerified ? {
        panNumber: verification.panNumber,
        fullName: verification.fullName,
        category: verification.category,
        aadhaarLinked: verification.aadhaarLinked,
        status: verification.status
      } : null
    });
  } catch (error) {
    console.error('Get PAN verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get PAN verification status'
    });
  }
});

// ============================================
// Bank Account Verification APIs
// ============================================

/**
 * Check if Bank verification is configured
 * GET /api/bank-verification/config-status
 */
app.get('/api/bank-verification/config-status', (req, res) => {
  const status = getBankConfigStatus();
  res.json({
    configured: status.configured,
    message: status.configured ? 'Bank verification is configured' : 'Bank verification is not configured'
  });
});

/**
 * Verify Bank Account
 * POST /api/bank-verification/verify
 * Body: { email: string, accountNumber: string, ifsc: string }
 */
app.post('/api/bank-verification/verify', async (req, res) => {
  try {
    const { email, accountNumber, ifsc } = req.body;

    if (!email || !accountNumber || !ifsc) {
      return res.status(400).json({
        success: false,
        message: 'Email, account number, and IFSC code are required'
      });
    }

    // Validate IFSC format (11 alphanumeric characters)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifsc.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IFSC format. Must be 11 characters (e.g., SBIN0001234)'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified with same account
    if (user.bankVerification?.isVerified &&
      user.bankVerification?.accountNumber === accountNumber &&
      user.bankVerification?.ifsc === ifsc.toUpperCase()) {
      return res.status(400).json({
        success: false,
        message: 'This bank account is already verified for your account',
        alreadyVerified: true,
        data: {
          accountNumber: user.bankVerification.accountNumber,
          ifsc: user.bankVerification.ifsc,
          fullName: user.bankVerification.fullName,
          bankName: user.bankVerification.bankName,
          verifiedAt: user.bankVerification.verifiedAt
        }
      });
    }

    console.log(`🔍 Verifying Bank Account for user: ${email}`);

    // Verify bank account using SurePass API
    const verificationResult = await verifyBankAccount(accountNumber, ifsc);

    if (!verificationResult.success) {
      return res.status(422).json(verificationResult);
    }

    // Check if account exists
    const accountExists = verificationResult.data.accountExists;

    if (!accountExists) {
      // Account doesn't exist, but we still have bank/IFSC details
      // Save the data but mark as unverified
      console.log(`⚠️ Account does not exist, but IFSC is valid. Saving bank details.`);

      user.bankVerification = {
        isVerified: false, // Mark as NOT verified since account doesn't exist
        verifiedAt: new Date(),
        ...verificationResult.data,
        remarks: 'Account number could not be verified, but IFSC and bank details are valid'
      };

      await user.save();

      return res.status(422).json({
        success: false,
        message: 'Bank account number could not be verified. Please check the account number. IFSC and bank details are correct.',
        data: verificationResult.data,
        partialVerification: true // Flag to show we have partial info
      });
    }

    // Account exists - full verification success
    user.bankVerification = {
      isVerified: true,
      verifiedAt: new Date(),
      ...verificationResult.data
    };

    await user.save();

    console.log(`✅ Bank account verified and saved for user: ${email}`);

    res.json({
      success: true,
      message: 'Bank account verified successfully',
      data: verificationResult.data
    });

  } catch (error) {
    console.error('Bank verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify bank account'
    });
  }
});

/**
 * Get Bank verification status
 * GET /api/bank-verification/status/:email
 */
app.get('/api/bank-verification/status/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const verification = user.bankVerification || {};

    res.json({
      success: true,
      isVerified: verification.isVerified || false,
      verifiedAt: verification.verifiedAt,
      data: verification.isVerified ? {
        accountNumber: verification.accountNumber,
        ifsc: verification.ifsc,
        fullName: verification.fullName,
        bankName: verification.bankName,
        branch: verification.branch,
        accountExists: verification.accountExists,
        status: verification.status
      } : null
    });
  } catch (error) {
    console.error('Get Bank verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bank verification status'
    });
  }
});

// ============================================
// Signature Capture & PDF Signing
// ============================================

app.post('/api/signature/save', async (req, res) => {
  try {
    const { email, name, signatureImage, location, signedDate } = req.body;

    if (!email || !signatureImage || !location) {
      return res.status(400).json({
        success: false,
        message: 'Email, signature image, and location are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.signature = {
      signatureImage,
      location,
      signedDate: signedDate || new Date(),
      savedAt: new Date(),
      isSaved: true
    };

    await user.save();

    res.json({
      success: true,
      message: 'Signature saved successfully',
      data: user.signature
    });
  } catch (error) {
    console.error('Signature save error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save signature'
    });
  }
});

app.get('/api/signature/status/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.signature && user.signature.isSaved) {
      res.json({
        success: true,
        data: user.signature
      });
    } else {
      res.json({
        success: true,
        data: null
      });
    }
  } catch (error) {
    console.error('Signature status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch signature status'
    });
  }
});

// ============================================
// Form Data Persistence
// ============================================

/**
 * Save form data to database
 * POST /api/forms/save
 */
app.post('/api/forms/save', async (req, res) => {
  try {
    const { email, formData } = req.body;

    if (!email || !formData) {
      return res.status(400).json({
        success: false,
        message: 'Email and form data are required'
      });
    }

    // Use findOneAndUpdate to atomically update and merge profileData
    // This prevents race conditions where concurrent saves overwrite each other
    // because they both read the old document before either has saved.
    // Use dot notation for nested fields update would be ideal, but since profileData is Mixed,
    // we can use $set to merge top-level keys of profileData if formData keys differ.
    // However, since formData might contain multiple keys, we'll rely on $set for the whole profileData
    // BUT that's still risky if we don't merge.
    
    // Better approach: Since formData usually contains specific sections (e.g. { joiningFormData: ... }),
    // we should construct a $set object that targets those specific keys deep inside profileData
    // to avoid overwriting other sections.
    
    const updateOps = { $set: { "profileData.lastUpdated": new Date() } };
    
    // For each key in formData (e.g. 'joiningFormData', 'form11Data'), set it specifically
    Object.keys(formData).forEach(key => {
      updateOps.$set[`profileData.${key}`] = formData[key];
    });

    const updatedUser = await User.findOneAndUpdate(
      { email },
      updateOps,
      { new: true, upsert: false }
    );

    if (!updatedUser) {
        return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Form data saved successfully',
      data: updatedUser.profileData
    });
  } catch (error) {
    console.error('Form data save error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save form data'
    });
  }
});

/**
 * Get user details including lock status
 * GET /api/user/:email
 */
app.get('/api/user/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isLocked: user.isLocked || false,
        status: user.status || 'pending',
        signature: user.signature,
        documents: user.documents || [],
        generatedDocuments: user.generatedDocuments || {},
        profileData: user.profileData || {},
        aadhaarVerification: user.aadhaarVerification || {}
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user data'
    });
  }
});

/**
 * Get saved form data
 * GET /api/forms/data/:email
 */
app.get('/api/forms/data/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.profileData || {}
    });
  } catch (error) {
    console.error('Get form data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve form data'
    });
  }
});

/**
 * Final submission - Lock profile and submit all forms
 * POST /api/forms/submit-all
 */
app.post('/api/forms/submit-all', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate all PDFs and save them locally and to Drive
    try {
      const { generatedDocuments, generatedSubfolderId } = await generateAndUploadAllPdfs(user);
      
      // Update user with generated documents info
      if (generatedDocuments) {
        user.generatedDocuments = generatedDocuments;
      }
      
      // Update generated subfolder ID if created
      if (generatedSubfolderId) {
        if (!user.driveFolder) user.driveFolder = {};
        user.driveFolder.generatedSubfolderId = generatedSubfolderId;
      }
      
      console.log('✅ Generated documents saved to user profile');
    } catch (pdfError) {
      console.error('Error generating PDFs during submission:', pdfError);
      // We continue even if PDF generation fails, but log it
    }

    // Lock profile and update status
    user.isLocked = true;
    user.status = 'submitted';
    // Mark modified for safety with mixed types
    user.markModified('generatedDocuments');
    user.markModified('driveFolder');
    
    await user.save();

    console.log(`✅ Profile submitted and locked for user: ${email}`);

    res.json({
      success: true,
      message: 'All forms submitted successfully. Your profile is now locked and awaiting admin approval.',
      data: {
        isLocked: user.isLocked,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Submit all forms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit forms'
    });
  }
});

/**
 * Generate fillable PDF forms (Form 11, Form F, Form 2)
 * POST /api/forms/generate-fillable/:formType
 */
app.post('/api/forms/generate-fillable/:formType', async (req, res) => {
  try {
    const { formType } = req.params;
    const { email, formData } = req.body;

    if (!email || !formData) {
      return res.status(400).json({
        success: false,
        message: 'Email and form data are required'
      });
    }

    // Get user signature from database
    const user = await User.findOne({ email });
    const signatureImage = user?.signature?.signatureImage || null;

    // Map formType to Python service endpoint

    const endpointMap = {
      'form11': 'fill-form11',
      'formF': 'fill-formF',
      'form2': 'fill-form2'
    };

    const pythonEndpoint = endpointMap[formType];
    if (!pythonEndpoint) {
      return res.status(400).json({
        success: false,
        message: 'Invalid form type'
      });
    }

    // USE ADOBE PDF SERVICES - Professional quality PDF filling
    console.log(`📄 Using Adobe PDF Services to generate ${formType}...`);

    // Import Adobe PDF service functions
    const { fillForm11Adobe, fillFormFAdobe, fillForm2Adobe } = await import('./services/fillFormsAdobe.js');

    // Convert base64 signature to buffer if exists
    let signatureBuffer = null;
    const sigSources = [
      signatureImage,
      formData?.employeeSignature,
      formData?.form11Signature,
      formData?.pfNominationSignature,
      formData?.form11Data?.employeeSignature,
      formData?.pfNominationData?.employeeSignature
    ];

    for (const sig of sigSources) {
      if (sig && typeof sig === 'string' && sig.startsWith('data:image')) {
        const base64Data = sig.replace(/^data:image\/\w+;base64,/, '');
        signatureBuffer = Buffer.from(base64Data, 'base64');
        console.log(`✍️ Signature found (${signatureBuffer.length} bytes)`);
        break;
      }
    }

    let pdfBuffer;
    switch (formType) {
      case 'form11':
        pdfBuffer = await fillForm11Adobe(formData, signatureBuffer);
        break;
      case 'formF':
        pdfBuffer = await fillFormFAdobe(formData, signatureBuffer);
        break;
      case 'form2':
        pdfBuffer = await fillForm2Adobe(formData, signatureBuffer);
        break;
      default:
        throw new Error('Invalid form type');
    }

    const filenameMap = {
      'form11': 'Form_11_Filled.pdf',
      'formF': 'Form_F_Filled.pdf',
      'form2': 'Form_2_Filled.pdf'
    };

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filenameMap[formType]}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate fillable PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error.message
    });
  }
});

/**
 * Admin: Unlock candidate profile
 * POST /api/admin/unlock-profile
 */
app.post('/api/admin/unlock-profile', async (req, res) => {
  try {
    const { candidateId } = req.body;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: 'Candidate ID is required'
      });
    }

    const user = await User.findById(candidateId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Unlock profile
    user.isLocked = false;
    user.status = 'pending'; // Reset to pending so they can edit again
    await user.save();

    console.log(`✅ Profile unlocked for candidate: ${user.email}`);

    res.json({
      success: true,
      message: 'Candidate profile unlocked successfully. They can now edit their forms.',
      data: {
        isLocked: user.isLocked,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Unlock profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlock profile'
    });
  }
});

// ============================================
// E-Sign Verification Endpoints
// ============================================

/**
 * Check E-Sign configuration status
 * GET /api/esign/config-status
 */
app.get('/api/esign/config-status', (req, res) => {
  const status = getESignConfigStatus();
  res.json(status);
});

/**
 * Initialize E-Sign - Generate token for SDK
 * POST /api/esign/initialize
 */
app.post('/api/esign/initialize', async (req, res) => {
  try {
    const { email, aadhaarNumber, documentBase64, documentName, purpose } = req.body;

    // Validation
    if (!email || !aadhaarNumber || !documentBase64) {
      return res.status(400).json({
        success: false,
        message: 'Email, Aadhaar number, and document are required'
      });
    }

    // Validate Aadhaar format (12 digits)
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Aadhaar number format. Must be 12 digits'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already completed
    if (user.esignVerification?.isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'E-Sign already completed for this user',
        alreadyCompleted: true,
        data: {
          completedAt: user.esignVerification.completedAt,
          documentName: user.esignVerification.documentName
        }
      });
    }

    console.log(`🔐 Initializing E-Sign for user: ${email}`);

    // Initialize E-Sign with SurePass
    const initResult = await initializeESign(
      aadhaarNumber,
      documentBase64,
      documentName || `${user.name}_Employment_Document.pdf`,
      purpose || 'Employment Document E-Sign'
    );

    if (!initResult.success) {
      return res.status(initResult.status_code || 422).json(initResult);
    }

    // Save initialization data to user
    user.esignVerification = {
      ...(user.esignVerification || {}),
      clientId: initResult.client_id,
      token: initResult.token,
      status: 'pending',
      documentName: documentName || `${user.name}_Employment_Document.pdf`,
      documentPurpose: purpose || 'Employment Document E-Sign',
      aadhaarNumber: aadhaarNumber.slice(0, 4) + '****' + aadhaarNumber.slice(-4), // Masked
      attempts: (user.esignVerification?.attempts || 0) + 1,
      lastUpdated: new Date()
    };

    await user.save();

    console.log(`✅ E-Sign initialized for user: ${email}, client ID: ${initResult.client_id}`);

    res.json({
      success: true,
      message: 'E-Sign initialized successfully',
      token: initResult.token,
      clientId: initResult.client_id
    });

  } catch (error) {
    console.error('E-Sign initialization error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize E-Sign'
    });
  }
});

/**
 * Handle E-Sign completion callback
 * POST /api/esign/complete
 */
app.post('/api/esign/complete', async (req, res) => {
  try {
    const { email, status_code, success, message, error, clientId } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`📝 Processing E-Sign completion for user: ${email}, status: ${status_code}`);

    // Update E-Sign status based on response
    const esignData = user.esignVerification || {};

    if (status_code === 200 && success === true) {
      // Success - E-Sign completed
      esignData.isCompleted = true;
      esignData.completedAt = new Date();
      esignData.status = 'completed';
      esignData.errorCode = null;
      esignData.errorMessage = null;

      console.log(`✅ E-Sign completed successfully for user: ${email}`);

      // Optional: Download signed document and upload to Google Drive
      try {
        const downloadResult = await downloadSignedDocument(clientId || esignData.clientId);
        if (downloadResult.success) {
          // TODO: Upload to Google Drive here if needed
          console.log(`📥 Signed document downloaded successfully`);
        }
      } catch (downloadError) {
        console.error('Failed to download signed document:', downloadError);
      }

    } else {
      // Failure or error
      esignData.isCompleted = false;
      esignData.status = 'failed';
      esignData.errorCode = error || 'UNKNOWN_ERROR';
      esignData.errorMessage = message || 'E-Sign process failed';

      console.log(`❌ E-Sign failed for user: ${email}, error: ${esignData.errorCode}`);
    }

    esignData.lastUpdated = new Date();
    user.esignVerification = esignData;

    await user.save();

    res.json({
      success: true,
      message: 'E-Sign status updated successfully',
      isCompleted: esignData.isCompleted,
      status: esignData.status
    });

  } catch (error) {
    console.error('E-Sign completion error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process E-Sign completion'
    });
  }
});

/**
 * Get E-Sign verification status
 * GET /api/esign/status/:email
 */
app.get('/api/esign/status/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const verification = user.esignVerification || {};

    res.json({
      success: true,
      isCompleted: verification.isCompleted || false,
      completedAt: verification.completedAt,
      status: verification.status || 'not_started',
      data: verification.isCompleted ? {
        documentName: verification.documentName,
        documentPurpose: verification.documentPurpose,
        completedAt: verification.completedAt,
        aadhaarNumber: verification.aadhaarNumber // masked
      } : null
    });
  } catch (error) {
    console.error('Get E-Sign status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get E-Sign status'
    });
  }
});

// ============================================
// Adobe PDF Debug Endpoints
// ============================================

/**
 * Debug: Get form field names from a PDF
 * GET /api/forms/debug-fields/:formType
 */
app.get('/api/forms/debug-fields/:formType', async (req, res) => {
  try {
    const { formType } = req.params;

    const { debugFormFields } = await import('./services/fillFormsAdobe.js');
    const fields = await debugFormFields(formType);

    res.json({
      success: true,
      formType,
      fieldCount: fields.length,
      fields
    });
  } catch (error) {
    console.error('Debug form fields error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get form fields',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
