import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import { appendToSheet } from './services/googleSheets.js';
import { appendToSheet as appendToGoogleSheet, updateSheetStatus } from './services/bgvGoogleSheets.js';
import { 
  hasValidToken, 
  getAuthUrl, 
  handleAuthCallback, 
  createCandidateFolder, 
  uploadFileToDrive, 
  uploadOrReplacePdf,
  listFolderFiles,
  getDriveStatus 
} from './services/googleDriveOAuth.js';
import { isWhitelisted, refreshWhitelist, getWhitelistStats } from './services/candidateWhitelist.js';
import { sendOtp, verifyOtp, resendOtp } from './services/msg91Otp.js';
import { validateAadhaarNumber, storeAadhaarData, getAadhaarDetails } from './services/aadhaarVerification.js';

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
app.use(express.json());


app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/esme_onboarding')
  .then(() => {
    console.log('✅ Connected to MongoDB');

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
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

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
    
    const existing = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ name, email, mobile, password });
    await user.save();
    
    console.log(`✅ New signup: ${name} (${email}) - Matched by ${whitelistCheck.matchedBy}`);
    
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
      query.email = email;
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
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    
    // Find user first to get name for folder creation
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    let driveFolder = existingUser.driveFolder;

    // Create Google Drive folder if connected and folder doesn't exist
    if (hasValidToken() && !driveFolder?.folderId) {
      try {
        const candidateName = profileData.fullName || existingUser.name;
        const department = profileData.department || profileData.profession || 'New Joiner';
        const city = profileData.currentCity || 'Unspecified';
        
        driveFolder = await createCandidateFolder(candidateName, department, city);
        console.log(`📁 Created Google Drive folder for ${candidateName}: ${driveFolder.folderLink}`);
      } catch (folderError) {
        console.error('⚠️ Could not create Drive folder:', folderError.message);
      }
    }

    // Update user with profile data and folder info
    const user = await User.findOneAndUpdate(
      { email },
      { 
        profileData, 
        status: 'completed',
        ...(driveFolder && { driveFolder })
      },
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
    const user = await User.findOne({ email });
    
    if (!user) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'User not found' });
    }


    if (user.isLocked) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ message: 'Your profile is locked. Please contact HR to make changes.' });
    }

    console.log(`📤 Uploading ${type} for ${user.name}`);

    const fileExt = req.file.originalname?.split('.').pop() || 'pdf';
    const candidateName = user.name.replace(/\s+/g, '_');
    const role = (user.profileData?.profession || 'New_Joiner').replace(/\s+/g, '_');
    const formattedFileName = `${type}_${candidateName}_${role}.${fileExt}`;

    let documentRecord = null;
    let driveFolder = user.driveFolder;


    if (hasValidToken()) {
      try {
        if (!driveFolder?.folderId) {
          driveFolder = await createCandidateFolder(
            user.name,
            user.profileData?.profession || 'New Joiner',
            user.profileData?.currentCity || 'Unspecified'
          );
          await User.findByIdAndUpdate(user._id, { driveFolder });
          console.log(`📁 Created Drive folder for ${user.name}`);
        }

        const driveFile = await uploadFileToDrive(
          driveFolder.folderId,
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
      console.log('📁 Using local storage...');
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

    await User.findOneAndUpdate(
      { email },
      { $push: { documents: documentRecord } }
    );

    res.json({ 
      success: true, 
      document: documentRecord,
      folderLink: driveFolder?.folderLink
    });
  } catch (err) {
    console.error('❌ Upload error:', err.message);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: err.message });
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
      document: documentRecord,
      folderLink: driveFolder?.folderLink
    });
  } catch (err) {
    console.error('❌ PDF upload error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/candidates/:id', async (req, res) => {
  try {
    const candidate = await User.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.patch('/api/candidates/:id/status', async (req, res) => {
  try {
    const { status, department, employeeId, hrRemarks, designation } = req.body;
    

    const updateData = { status };
    

    if (department) {
      updateData['profileData.department'] = department;
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
      updateData.approvedAt = new Date();
      updateData.hrVerified = true;
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






app.get('/api/auth/google/status', async (req, res) => {
  try {
    const status = await getDriveStatus();
    res.json(status);
  } catch (error) {
    res.json({ connected: false, message: error.message });
  }
});


app.get('/api/auth/google', (req, res) => {
  try {
    const authUrl = getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send('Authorization code not provided');
    }
    
    await handleAuthCallback(code);
    

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Drive Connected</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f9ff; }
            .container { text-align: center; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            h1 { color: #16a34a; }
            p { color: #666; }
            .btn { background: #2563eb; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; text-decoration: none; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Google Drive Connected!</h1>
            <p>Your Google Drive has been successfully connected.</p>
            <p>File uploads will now be stored in your Drive.</p>
            <a href="/" class="btn">Go to Dashboard</a>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Error</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: red;">❌ Connection Failed</h1>
          <p>${error.message}</p>
          <a href="/">Go back</a>
        </body>
      </html>
    `);
  }
});






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
    

    const existing = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existing) {
      return res.status(400).json({ message: 'Admin with this email or mobile already exists.' });
    }
    
    const newAdmin = new User({
      name,
      email,
      mobile,
      password,
      role: 'admin',
      createdBy: creatorId
    });
    
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
    const { userId, currentPassword, newPassword } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    

    if (user.password !== currentPassword) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }
    

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters.' });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
