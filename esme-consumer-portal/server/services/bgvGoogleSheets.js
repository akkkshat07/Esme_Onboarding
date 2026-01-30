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
    
    // Email is in column K (11th column) in the BGV sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${sheetName}'!K:K` 
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
    

    const getValue = (key, ...altKeys) => {

      if (profileData[key]) return profileData[key];

      if (joiningData[key]) return joiningData[key];

      if (form11Data[key]) return form11Data[key];

      if (formFData[key]) return formFData[key];

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

    // BGV Sheet columns - ONLY these 17 fields from Personal Information page
    // Column headers in order:
    // A: Staff ID/Employee ID | B: 12-digit Aadhaar | C: 10-digit Mobile | D: Profession/Title
    // E: Current City | F: Entity | G: Full Name | H: Gender (M/F/T) | I: Date of Birth
    // J: Age | K: Email | L: S/O or D/O or C/O (Father's name) | M: Permanent/Aadhaar Address
    // N: Current/Local Address | O: Pincode | P: Date of Joining | Q: Alternate Mobile
    const rowData = [
      getValue('staffIdEmployeeId', 'employeeCode', 'employeeId'),  // A: Staff ID or Employee ID
      getValue('aadhaarNumber'),                                     // B: 12-digit Aadhaar number
      mobileNumber,                                                  // C: 10-digit Mobile Number
      getValue('profession', 'designation'),                         // D: Profession / Title
      getValue('currentCity'),                                       // E: Current City
      getValue('entity', 'department', 'division'),                  // F: Entity
      getValue('fullName') || candidateData.name || '',              // G: Full name (as per Aadhaar)
      getValue('gender'),                                            // H: Gender (M/F/T)
      getValue('dateOfBirth', 'dob'),                                // I: Date of Birth (dd-mm-yyyy)
      getValue('age'),                                               // J: Age (if DoB not available)
      candidateEmail,                                                // K: Email
      getValue('fatherName', 'fatherHusbandName'),                   // L: S/O, D/O, C/O (Father's name)
      getValue('permanentAddress', 'aadhaarAddress'),                // M: Address as per Aadhaar/Permanent
      getValue('currentAddress', 'localAddress'),                    // N: Current/Local Address
      getValue('currentPincode', 'pincode', 'permanentPincode'),     // O: Pincode (for current address)
      getValue('dateOfJoining', 'doj'),                              // P: Date of Joining (dd-mm-yyyy)
      getValue('alternateMobileNumber', 'alternateMobile'),          // Q: Alternate Mobile Number
    ];

    console.log(`📝 BGV Data to sync (${rowData.length} columns):`, JSON.stringify(rowData));


    const existingRowIndex = await findRowByEmail(sheets, sheetId, sheetName, candidateEmail);

    let response;
    if (existingRowIndex) {
 
      console.log(`🔄 Candidate found at row ${existingRowIndex}, updating...`);
      response = await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `'${sheetName}'!A${existingRowIndex}:Q${existingRowIndex}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [rowData] }
      });
      console.log(`✅ Updated row ${existingRowIndex} in ${sheetKey} sheet`);
    } else {

      console.log(`➕ New candidate, appending to sheet...`);
      response = await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `'${sheetName}'!A:Q`,
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
