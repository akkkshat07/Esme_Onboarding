import { google } from 'googleapis';

const getAuthClient = () => {
  try {
    const serviceAccountKey = {
      type: 'service_account',
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
    };

    if (!serviceAccountKey.private_key) {
      throw new Error('GOOGLE_PRIVATE_KEY not found in .env');
    }
    if (!serviceAccountKey.client_email) {
      throw new Error('GOOGLE_CLIENT_EMAIL not found in .env');
    }

    return new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
  } catch (error) {
    console.error('❌ Auth Client Error:', error.message);
    throw error;
  }
};

const getSheetsClient = () => {
  const auth = getAuthClient();
  return google.sheets({ version: 'v4', auth });
};


const findRowByEmail = async (sheets, sheetId, sheetName, email) => {
  try {
    if (!email) {
      console.log('⚠️ No email provided for lookup');
      return null;
    }
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${sheetName}'!L:L` 
    });

    const emails = response.data.values?.flat() || [];
    console.log(`🔍 Searching for email: ${email.toLowerCase()} in ${emails.length} rows`);
    

    for (let i = 0; i < emails.length; i++) {
      const cellEmail = emails[i]?.toString().toLowerCase().trim();
      if (cellEmail === email.toLowerCase().trim()) {
        const rowNumber = i + 1; 
        console.log(`✅ Found existing email at row ${rowNumber}`);
        return rowNumber;
      }
    }
    
    console.log(`ℹ️ Email not found in sheet, will append new row`);
    return null;
  } catch (error) {
    console.error('Error finding row by email:', error.message);
    return null;
  }
};

const appendToSheet = async (sheetKey, candidateData) => {
  try {
    console.log(`📊 Syncing to ${sheetKey} sheet...`);
    
    const sheets = getSheetsClient();
    const sheetId = process.env[`GOOGLE_SHEET_${sheetKey.toUpperCase()}`];
    
    console.log(`🔍 Looking for sheet ID: GOOGLE_SHEET_${sheetKey.toUpperCase()}`);
    console.log(`📌 Sheet ID: ${sheetId}`);
    
    if (!sheetId) {
      throw new Error(`Sheet ID not found for: GOOGLE_SHEET_${sheetKey.toUpperCase()}`);
    }

    console.log(`🔐 Checking sheet metadata...`);
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: sheetId
    });
    
    const sheetNames = metadata.data.sheets?.map(s => s.properties.title) || [];
    console.log(`📋 Available sheets: ${sheetNames.join(', ')}`);

    let sheetName = 'Sheet1';
    if (sheetNames.length > 0) {
      sheetName = sheetNames[0];
    }

    const profileData = candidateData.profileData || {};
    const joiningData = profileData.joiningFormData || {};
    const formFData = profileData.formFData || {};
    const form11Data = profileData.form11Data || {};
    
    // Helper to get value from multiple sources
    const getValue = (key, ...altKeys) => {
      // Check profileData first
      if (profileData[key]) return profileData[key];
      // Check joiningFormData
      if (joiningData[key]) return joiningData[key];
      // Check form11Data
      if (form11Data[key]) return form11Data[key];
      // Check formFData
      if (formFData[key]) return formFData[key];
      // Check alternative keys
      for (const altKey of altKeys) {
        if (profileData[altKey]) return profileData[altKey];
        if (joiningData[altKey]) return joiningData[altKey];
      }
      return '';
    };
    
    const candidateEmail = getValue('email', 'personalEmail') || candidateData.email || '';
    
    const mobileNumber = getValue('mobileNumber', 'phone') || candidateData.mobile || candidateData.phone || '';
    console.log(`📱 Mobile number sources - profileData.mobileNumber: ${profileData.mobileNumber}, joiningData.mobileNumber: ${joiningData.mobileNumber}, candidateData.mobile: ${candidateData.mobile}`);
    console.log(`📱 Final mobile number: ${mobileNumber}`);

    const rowData = [
      getValue('staffIdEmployeeId', 'employeeCode'),           
      getValue('aadhaarNumber'),              
      mobileNumber,                                   
      getValue('profession', 'designation'),                  
      getValue('currentCity'),                
      getValue('entity', 'department'),                       
      getValue('fullName') || candidateData.name || '', 
      getValue('gender'),                      
      getValue('dateOfBirth'),                 
      getValue('age'),                         
      candidateEmail,                                 
      getValue('fatherName'),                  
      getValue('permanentAddress'),            
      getValue('currentAddress'),              
      getValue('pincode', 'currentPincode', 'permanentPincode'),                      
      getValue('dateOfJoining'),               
   
      getValue('alternateMobileNumber', 'alternateMobile'),        
      getValue('bloodGroup'),                 
      getValue('maritalStatus'),               
      getValue('bankName'),                    
      getValue('accountNumber', 'bankAccountNumber'),                
      getValue('ifscCode'),                    
      getValue('accountHolderName'),            
      getValue('panNumber'),                   
      getValue('uanNumber'),                   
      getValue('passportNumber'),               

      getValue('emergencyContactName'),        
      getValue('emergencyContactRelation'),     
      getValue('emergencyContactNumber', 'emergencyContactMobile'),      

      getValue('spouseName'),                  
      getValue('nomineeName') || formFData.nominees?.[0]?.name || '',                
      getValue('nomineeRelationship') || formFData.nominees?.[0]?.relationship || '',          
      getValue('nomineeDOB'),                  
      getValue('department'),                
      candidateData.status || '',                    
    ];

    console.log(`📝 Data to sync (${rowData.length} columns):`, JSON.stringify(rowData.slice(0, 10)) + '...');


    const existingRowIndex = await findRowByEmail(sheets, sheetId, sheetName, candidateEmail);

    let response;
    if (existingRowIndex) {
 
      console.log(`🔄 Candidate found at row ${existingRowIndex}, updating...`);
      response = await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `'${sheetName}'!B${existingRowIndex}:AJ${existingRowIndex}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [rowData] }
      });
      console.log(`✅ Updated row ${existingRowIndex} in ${sheetKey} sheet`);
    } else {

      console.log(`➕ New candidate, appending to sheet...`);
      response = await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `'${sheetName}'!B:AJ`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: { values: [rowData] }
      });
      console.log(`✅ Appended new row to ${sheetKey} sheet`);
    }

    return response.data;
  } catch (error) {
    console.error(`❌ Error syncing to ${sheetKey} sheet:`, error.message);
    console.error(`📌 Full error:`, error.errors?.[0] || error);
    throw error;
  }
};

const updateSheetStatus = async (sheetKey, candidateName, statusColumnValue) => {
  try {
    const sheets = getSheetsClient();
    const sheetId = process.env[`GOOGLE_SHEET_${sheetKey.toUpperCase()}`];
    
    if (!sheetId) {
      throw new Error(`Sheet ID not found for: GOOGLE_SHEET_${sheetKey.toUpperCase()}`);
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!G:G'
    });

    const names = response.data.values?.flat() || [];
    const rowIndex = names.findIndex(name => name?.toLowerCase() === candidateName.toLowerCase()) + 1;

    if (rowIndex <= 1) {
      throw new Error(`Candidate "${candidateName}" not found`);
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `Sheet1!R${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [[statusColumnValue]] }
    });

    return true;
  } catch (error) {
    console.error(`Error updating ${sheetKey} sheet status:`, error.message);
    throw error;
  }
};

export { appendToSheet, updateSheetStatus, getSheetsClient };
