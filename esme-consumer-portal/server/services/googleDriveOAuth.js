import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const TOKEN_PATH = path.join(__dirname, '..', 'drive_token.json');


const getOAuth2Client = () => {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET must be set in .env');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};


export const hasValidToken = () => {
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
      return !!tokens.refresh_token;
    }
    return false;
  } catch (error) {
    return false;
  }
};


export const getAuthUrl = () => {
  const oauth2Client = getOAuth2Client();
  const scopes = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
};


export const handleAuthCallback = async (code) => {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  

  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log('✅ Google Drive tokens saved successfully');
  
  return tokens;
};


const getDriveClient = async () => {
  const oauth2Client = getOAuth2Client();
  
  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error('Google Drive not connected. Please authorize first at /api/auth/google');
  }

  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
  oauth2Client.setCredentials(tokens);


  oauth2Client.on('tokens', (newTokens) => {
    const updatedTokens = { ...tokens, ...newTokens };
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(updatedTokens, null, 2));
    console.log('🔄 Tokens refreshed and saved');
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
};


export const createCandidateFolder = async (candidateName, position, city) => {
  try {
    const drive = await getDriveClient();
    const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!parentFolderId) {
      throw new Error('GOOGLE_DRIVE_FOLDER_ID not set in .env');
    }

    const folderName = `${candidateName} - ${position || 'New Joiner'} - ${city || 'Unspecified'}`;


    const existingFolders = await drive.files.list({
      q: `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name, webViewLink)'
    });

    if (existingFolders.data.files?.length > 0) {
      console.log(`📁 Folder already exists: ${folderName}`);
      return {
        folderId: existingFolders.data.files[0].id,
        folderName,
        folderLink: existingFolders.data.files[0].webViewLink
      };
    }


    const folder = await drive.files.create({
      resource: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId]
      },
      fields: 'id, name, webViewLink'
    });

    console.log(`✅ Created folder: ${folderName} (${folder.data.id})`);

    return {
      folderId: folder.data.id,
      folderName,
      folderLink: folder.data.webViewLink
    };
  } catch (error) {
    console.error('❌ Error creating folder:', error.message);
    throw error;
  }
};


export const uploadFileToDrive = async (folderId, filePath, fileName, mimeType) => {
  try {
    const drive = await getDriveClient();

    const file = await drive.files.create({
      resource: {
        name: fileName,
        parents: [folderId]
      },
      media: {
        mimeType: mimeType || 'application/octet-stream',
        body: fs.createReadStream(filePath)
      },
      fields: 'id, name, webViewLink, webContentLink'
    });

    console.log(`✅ Uploaded file: ${fileName} (${file.data.id})`);


    try {
      await drive.permissions.create({
        fileId: file.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });
    } catch (permError) {
      console.log('⚠️ Could not set public permissions');
    }

    return {
      fileId: file.data.id,
      fileName: file.data.name,
      viewLink: file.data.webViewLink,
      downloadLink: file.data.webContentLink
    };
  } catch (error) {
    console.error('❌ Error uploading file:', error.message);
    throw error;
  }
};


export const listFolderFiles = async (folderId) => {
  try {
    const drive = await getDriveClient();

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink, createdTime)',
      orderBy: 'createdTime desc'
    });

    return response.data.files || [];
  } catch (error) {
    console.error('❌ Error listing files:', error.message);
    throw error;
  }
};


export const deleteFileFromDrive = async (fileId) => {
  try {
    const drive = await getDriveClient();
    await drive.files.delete({ fileId });
    console.log(`🗑️ Deleted file: ${fileId}`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting file:', error.message);
    throw error;
  }
};


export const getDriveStatus = async () => {
  try {
    if (!hasValidToken()) {
      return { connected: false, message: 'Not connected' };
    }

    const drive = await getDriveClient();
    const about = await drive.about.get({ fields: 'user' });
    
    return {
      connected: true,
      user: about.data.user?.emailAddress,
      displayName: about.data.user?.displayName
    };
  } catch (error) {
    return { connected: false, message: error.message };
  }
};

export default {
  hasValidToken,
  getAuthUrl,
  handleAuthCallback,
  createCandidateFolder,
  uploadFileToDrive,
  listFolderFiles,
  deleteFileFromDrive,
  getDriveStatus
};
