import { fillForm11Adobe, fillFormFAdobe, fillForm2Adobe } from './fillFormsAdobe.js';
import {
  createSubfolder,
  uploadOrReplacePdf
} from './googleDrive.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Import client-side form generators (now work server-side!)
import { generateJoiningFormPDF } from '../../src/utils/generateJoiningForm.js';
import { generateMedicalInsuranceFormPDF } from '../../src/utils/generateMedicalForm.js';
import { generateSelfDeclarationFormPDF } from '../../src/utils/generateSelfDeclaration.js';
import { generatePolicyAcknowledgment } from '../../src/utils/generatePolicyAcknowledgment.js';
import { generateChecklistPDF } from '../../src/utils/generateChecklist.js';

// Helper to get signature buffer from user data
const getSignatureBuffer = (data) => {
  const sigImage = (typeof data.signature === 'string' ? data.signature : data.signature?.signatureImage) ||
    data.profileData?.employeeSignature ||
    data.profileData?.form11Signature ||
    data.profileData?.pfNominationSignature || null;

  if (sigImage && typeof sigImage === 'string' && sigImage.startsWith('data:image')) {
    const base64Data = sigImage.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  }
  return null;
};

export const generateAndUploadAllPdfs = async (user) => {
  try {
    console.log(`📄 Generating Adobe PDF forms for ${user.name || user.email}...`);

    if (!user.driveFolder?.folderId) {
      console.log('⚠️ No Drive folder, will save locally only');
    }

    let generatedSubfolderId = null;
    if (user.driveFolder?.folderId) {
      try {
        generatedSubfolderId = await createSubfolder(user.driveFolder.folderId, 'generated');
      } catch (err) {
        console.log('⚠️ Could not create Drive subfolder, saving locally only');
      }
    }

    const signatureBuffer = getSignatureBuffer(user);
    const generatedDocs = {};

    // Convert Mongoose document to plain object
    const userObj = user.toObject ? user.toObject() : user;

    // Prepare candidate data by merging profileData with top-level fields
    // Extract joiningFormData (it might be directly on userObj or inside profileData)
    const jf = userObj.profileData?.joiningFormData || userObj.joiningFormData || {};

    // Construct derived profile data similar to how it's done in CandidateDashboard.jsx
    const derivedProfileData = {
      ...userObj.profileData,
      ...jf, // Spread ALL joining form data to catch loose fields (e.g. previous employment)
      // Explicitly include form data objects for Checklist generator (which checks profileData)
      form11Data: userObj.profileData?.form11Data || userObj.form11Data,
      formFData: userObj.profileData?.formFData || userObj.formFData,
      pfNominationData: userObj.profileData?.form2Data || userObj.pfNominationData,
      medicalInsuranceData: userObj.profileData?.medicalInsuranceData || userObj.medicalInsuranceData,
      insuranceData: userObj.profileData?.medicalInsuranceData || userObj.medicalInsuranceData, // Alias
      selfDeclarationData: userObj.profileData?.selfDeclarationData || userObj.selfDeclarationData,
      joiningFormData: jf,

      fullName: jf.firstName ? `${jf.firstName} ${jf.lastName || ''}`.trim() : (userObj.name || ''),
      dateOfBirth: jf.dob,
      fatherName: jf.fatherName,
      motherName: jf.motherName,
      spouseName: jf.spouseName,
      gender: jf.gender,
      bloodGroup: jf.bloodGroup,
      maritalStatus: jf.maritalStatus,
      nationality: jf.nationality,
      religion: jf.religion,
      mobileNumber: jf.phone || userObj.mobile,
      email: jf.emailId || userObj.email,
      currentAddress: jf.presentAddress,
      currentCity: jf.presentCity,
      pincode: jf.presentPincode,
      permanentAddress: jf.permanentAddress,
      permanentCity: jf.permanentCity,
      permanentState: jf.permanentState,
      aadhaarNumber: jf.aadhaarNumber,
      panNumber: jf.panNumber,
      bankName: jf.bankName,
      accountNumber: jf.bankAccountNumber,
      ifscCode: jf.bankIfsc,
      accountHolderName: jf.firstName ? `${jf.firstName} ${jf.lastName || ''}`.trim() : '',
      uanNumber: jf.uanNumber,
      emergencyContactName: jf.emergencyContactName,
      emergencyContactRelation: jf.emergencyContactRelation,
      emergencyContactNumber: jf.emergencyContactPhone,
      department: jf.department,
      profession: jf.designation,
      dateOfJoining: jf.dateOfJoining || new Date().toISOString().split('T')[0]
    };

    // Prepare candidate data with the derived profile data
    const candidateData = {
      ...userObj,
      ...derivedProfileData, // Spread derived data to top level for Adobe generators!
      profileData: derivedProfileData, // Keep it nested for client-side generators
      // Ensure form-specific data is accessible at top level
      form11Data: userObj.profileData?.form11Data || userObj.form11Data,
      formFData: userObj.profileData?.formFData || userObj.formFData,
      form2Data: userObj.profileData?.form2Data || userObj.form2Data,
      pfNominationData: userObj.profileData?.form2Data || userObj.pfNominationData,
      // Ensure nominees are accessible
      epfNominees: userObj.profileData?.epfNominees || userObj.profileData?.form2EPFNominees || userObj.epfNominees,
      epsFamilyNominees: userObj.profileData?.epsNominees || userObj.profileData?.form2FamilyMembers || userObj.profileData?.familyMembers || userObj.epsFamilyNominees,
      nominees: user.profileData?.formFNominees || user.nominees || derivedProfileData.nominees,
      // Fix signature for client-side generators which expect a string
      signature: userObj.signature?.signatureImage || userObj.signature
    };

    console.log('🔍 DEBUG: Candidate Data for Form Generation:');
    console.log('Name:', candidateData.name);
    console.log('Profile Data Keys:', Object.keys(candidateData.profileData || {}));
    console.log('Form 11 Data:', JSON.stringify(candidateData.form11Data || {}, null, 2));
    console.log('Joining Form Data:', JSON.stringify(candidateData.joiningFormData || {}, null, 2));
    console.log('Education Details:', JSON.stringify(candidateData.educationDetails || {}, null, 2));

    // Generate the 3 Adobe PDF forms (Form 11, Form F, Form 2/PF Nomination)
    const adobeForms = [
      { key: 'form11', fileName: 'Form_11_Filled.pdf', generator: fillForm11Adobe },
      { key: 'formF', fileName: 'Form_F_Filled.pdf', generator: fillFormFAdobe },
      { key: 'pfNomination', fileName: 'PF_Nomination_Form_2_Filled.pdf', generator: fillForm2Adobe }
    ];

    for (const { key, fileName, generator } of adobeForms) {
      try {
        console.log(`📝 Generating ${fileName} with Adobe PDF Services...`);
        const pdfBuffer = await generator(candidateData, signatureBuffer);

        // Save to temp file
        const tmpDir = os.tmpdir();
        const tmpFilePath = path.join(tmpDir, `${Date.now()}_${fileName}`);
        fs.writeFileSync(tmpFilePath, pdfBuffer);

        let fileId, viewLink, downloadLink;

        // Try to upload to Drive first
        if (generatedSubfolderId) {
          try {
            const uploadResult = await uploadOrReplacePdf(generatedSubfolderId, tmpFilePath, fileName);

            if (typeof uploadResult === 'string') {
              fileId = uploadResult;
              viewLink = `https://drive.google.com/file/d/${uploadResult}/view`;
              downloadLink = `https://drive.google.com/uc?export=download&id=${uploadResult}`;
            } else {
              fileId = uploadResult.fileId;
              viewLink = uploadResult.viewLink;
              downloadLink = uploadResult.downloadLink;
            }

            console.log(`✅ Uploaded ${fileName} to Drive`);
          } catch (driveError) {
            console.log(`⚠️ Drive upload failed for ${fileName}: ${driveError.message}`);
          }
        }

        // Save locally (always, as backup or primary)
        if (!fileId) {
          const candidateName = (user.profileData?.fullName || user.name).replace(/[^a-zA-Z0-9]/g, '_');
          const localDir = path.join(process.cwd(), 'uploads', candidateName, 'generated');

          if (!fs.existsSync(localDir)) {
            fs.mkdirSync(localDir, { recursive: true });
          }

          const localFilePath = path.join(localDir, fileName);
          fs.copyFileSync(tmpFilePath, localFilePath);

          const relativePath = `/uploads/${candidateName}/generated/${fileName}`;
          viewLink = relativePath;
          downloadLink = relativePath;

          console.log(`✅ Saved ${fileName} locally`);
        }

        // Delete temp file
        fs.unlinkSync(tmpFilePath);

        generatedDocs[key] = {
          fileId: fileId || null,
          fileName: fileName,
          viewLink: viewLink,
          downloadLink: downloadLink,
          generatedAt: new Date()
        };

      } catch (error) {
        console.error(`❌ Error generating ${fileName}:`, error.message);
      }
    }

    // Generate the 5 client-side forms (same as candidate dashboard!)
    const clientForms = [
      { key: 'joiningForm', fileName: 'Joining_Form.pdf', generator: generateJoiningFormPDF },
      { key: 'medicalForm', fileName: 'Medical_Insurance_Form.pdf', generator: generateMedicalInsuranceFormPDF },
      { key: 'selfDeclaration', fileName: 'Self_Declaration.pdf', generator: generateSelfDeclarationFormPDF },
      { key: 'policyAcknowledgment', fileName: 'Policy_Acknowledgment.pdf', generator: generatePolicyAcknowledgment },
      { key: 'checklist', fileName: 'Document_Checklist.pdf', generator: generateChecklistPDF }
    ];

    for (const { key, fileName, generator } of clientForms) {
      try {
        console.log(`📝 Generating ${fileName} (same as candidate dashboard)...`);

        // Generate PDF using jsPDF (returns jsPDF doc object)
        const doc = await generator(candidateData);
        if (!doc) throw new Error(`${fileName}: Generator returned null`);

        // Convert jsPDF doc to buffer
        // Note: 'arraybuffer' output from jsPDF, then Buffer.from
        const pdfArrayBuffer = doc.output('arraybuffer');
        const pdfBuffer = Buffer.from(pdfArrayBuffer);

        const candidateName = (user.profileData?.fullName || user.name).replace(/[^a-zA-Z0-9]/g, '_');
        const localDir = path.join(process.cwd(), 'uploads', candidateName, 'generated');
        if (!fs.existsSync(localDir)) {
          fs.mkdirSync(localDir, { recursive: true });
        }
        
        const localFilePath = path.join(localDir, fileName);
        fs.writeFileSync(localFilePath, pdfBuffer);

        let fileId = null;
        let viewLink = `/uploads/${candidateName}/generated/${fileName}`;
        let downloadLink = viewLink;

        // Try Drive Upload
        if (generatedSubfolderId) {
          try {
             // Use our helper which handles replace/upload
             const driveResult = await uploadOrReplacePdf(generatedSubfolderId, localFilePath, fileName);
             if (typeof driveResult === 'object') {
                fileId = driveResult.fileId;
                viewLink = driveResult.viewLink;
                downloadLink = driveResult.downloadLink;
             } else {
                // Fallback for older return type
                fileId = driveResult;
                viewLink = `https://drive.google.com/file/d/${fileId}/view`;
             }
             console.log(`✅ Uploaded ${fileName} to Drive: ${fileId}`);
          } catch (driveErr) {
             console.error(`⚠️ Failed to upload ${fileName} to Drive:`, driveErr.message);
          }
        }

        generatedDocs[key] = {
          fileId: fileId,
          fileName: fileName,
          viewLink: viewLink,
          downloadLink: downloadLink,
          generatedAt: new Date()
        };

        console.log(`✅ Generated & Saved ${fileName}`);

      } catch (error) {
        console.error(`❌ Error generating ${fileName}:`, error.message);
      }
    }

    return {
      generatedSubfolderId: generatedSubfolderId,
      generatedDocuments: generatedDocs
    };
  } catch (error) {
    console.error('❌ Error in generateAndUploadAllPdfs:', error.message);
    throw error;
  }
};

export default { generateAndUploadAllPdfs };
