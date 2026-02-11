import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const getAuthClient = () => {
  const serviceAccountKey = {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
  };

  return new google.auth.GoogleAuth({
    credentials: serviceAccountKey,
    scopes: ['https://www.googleapis.com/auth/drive']
  });
};

const getDriveClient = () => {
  const auth = getAuthClient();
  return google.drive({ version: 'v3', auth });
};


export const createCandidateFolder = async (candidateName, position, city) => {
  try {
    const drive = getDriveClient();
    const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    if (!parentFolderId) {
      throw new Error('GOOGLE_DRIVE_FOLDER_ID not set in .env');
    }


    const folderName = `${candidateName} - ${position || 'New Joiner'} - ${city || 'Unspecified'}`;
    

    const existingFolders = await drive.files.list({
      q: `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name, webViewLink)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });

    if (existingFolders.data.files?.length > 0) {
      console.log(`📁 Folder already exists: ${folderName}`);
      return {
        folderId: existingFolders.data.files[0].id,
        folderName,
        folderLink: existingFolders.data.files[0].webViewLink
      };
    }


    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId]
    };

    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: 'id, name, webViewLink',
      supportsAllDrives: true
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
    const drive = getDriveClient();
    
    const fileMetadata = {
      name: fileName,
      parents: [folderId]
    };

    const media = {
      mimeType: mimeType || 'application/octet-stream',
      body: fs.createReadStream(filePath)
    };


    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink',
      supportsAllDrives: true
    });

    console.log(`✅ Uploaded file: ${fileName} (${file.data.id})`);


    try {
      await drive.permissions.create({
        fileId: file.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        },
        supportsAllDrives: true
      });
    } catch (permError) {
      console.log('⚠️ Could not set public permissions (file will use folder permissions)');
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
    const drive = getDriveClient();
    
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
    const drive = getDriveClient();
    await drive.files.delete({ fileId, supportsAllDrives: true });
    console.log(`🗑️ Deleted file: ${fileId}`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting file:', error.message);
    throw error;
  }
};


export const createSubfolder = async (parentFolderId, folderName) => {
  try {
    const drive = getDriveClient();
    
    const existingFolders = await drive.files.list({
      q: `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });

    if (existingFolders.data.files?.length > 0) {
      console.log(`📁 Subfolder already exists: ${folderName}`);
      return existingFolders.data.files[0].id;
    }

    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId]
    };

    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: 'id, name',
      supportsAllDrives: true
    });

    console.log(`✅ Created subfolder: ${folderName} (${folder.data.id})`);
    return folder.data.id;
  } catch (error) {
    console.error('❌ Error creating subfolder:', error.message);
    throw error;
  }
};


export const uploadOrReplacePdf = async (folderId, pdfPath, pdfName) => {
  try {
    const drive = getDriveClient();
    
    // Check if file already exists
    const existingFiles = await drive.files.list({
      q: `name='${pdfName}' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });

    if (existingFiles.data.files?.length > 0) {
      // Replace existing file
      const fileId = existingFiles.data.files[0].id;
      
      const media = {
        mimeType: 'application/pdf',
        body: fs.createReadStream(pdfPath)
      };

      await drive.files.update({
        fileId: fileId,
        media: media,
        supportsAllDrives: true
      });

      console.log(`🔄 Replaced existing PDF: ${pdfName}`);
      return fileId;
    } else {
      // Upload new file
      const result = await uploadFileToDrive(folderId, pdfPath, pdfName, 'application/pdf');
      return result.fileId;
    }
  } catch (error) {
    console.error('❌ Error uploading/replacing PDF:', error.message);
    throw error;
  }
};


export const downloadFileFromDrive = async (fileId) => {
  try {
    const drive = getDriveClient();
    
    const response = await drive.files.get(
      { fileId, alt: 'media', supportsAllDrives: true },
      { responseType: 'stream' }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Error downloading file from Drive:', error.message);
    throw error;
  }
};


export const getDriveStatus = async () => {
  try {
    const projectId = process.env.GOOGLE_PROJECT_ID;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!projectId || !clientEmail || !privateKey) {
      return {
        connected: false,
        message: 'Service Account credentials not configured. Please set GOOGLE_PROJECT_ID, GOOGLE_CLIENT_EMAIL, and GOOGLE_PRIVATE_KEY in .env'
      };
    }

    if (!parentFolderId) {
      return {
        connected: false,
        message: 'GOOGLE_DRIVE_FOLDER_ID not configured'
      };
    }

    // Test the connection
    const drive = getDriveClient();
    await drive.files.get({
      fileId: parentFolderId,
      fields: 'id, name',
      supportsAllDrives: true
    });

    return {
      connected: true,
      message: 'Service Account connected successfully',
      serviceAccount: clientEmail
    };
  } catch (error) {
    return {
      connected: false,
      message: `Service Account error: ${error.message}`
    };
  }
};


export const hasValidToken = () => {
  // For Service Account, check if credentials are present
  const projectId = process.env.GOOGLE_PROJECT_ID;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  
  return !!(projectId && clientEmail && privateKey);
};

export default {
  createCandidateFolder,
  uploadFileToDrive,
  listFolderFiles,
  deleteFileFromDrive,
  createSubfolder,
  uploadOrReplacePdf,
  downloadFileFromDrive,
  getDriveStatus,
  hasValidToken
};
