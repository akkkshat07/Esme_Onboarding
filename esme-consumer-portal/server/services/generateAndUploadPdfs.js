import PDFDocument from 'pdfkit';
import { 
  createSubfolder, 
  uploadPdfBufferToDrive, 
  uploadOrReplacePdf 
} from './googleDriveOAuth.js';

const generatePdfBuffer = (generateFunction, data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      generateFunction(doc, data);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const generateJoiningFormPdf = (doc, data) => {
  const pd = data.profileData || {};
  
  doc.fontSize(16).text('EMPLOYEE JOINING FORM', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('ESME CONSUMER (P) LTD', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(10);
  doc.text(`Full Name: ${pd.fullName || data.name || ''}`);
  doc.text(`Email: ${data.email || ''}`);
  doc.text(`Mobile: ${data.mobile || ''}`);
  doc.text(`Date of Birth: ${pd.dateOfBirth || ''}`);
  doc.text(`Gender: ${pd.gender || ''}`);
  doc.text(`Blood Group: ${pd.bloodGroup || ''}`);
  doc.moveDown();
  
  doc.text(`Designation: ${pd.designation || ''}`);
  doc.text(`Department: ${pd.department || ''}`);
  doc.text(`Date of Joining: ${pd.dateOfJoining || ''}`);
  doc.moveDown();
  
  doc.text(`Father's Name: ${pd.fatherName || ''}`);
  doc.text(`Mother's Name: ${pd.motherName || ''}`);
  doc.moveDown();
  
  doc.text(`Current Address: ${pd.currentAddress || ''}`);
  doc.text(`City: ${pd.currentCity || ''}, State: ${pd.currentState || ''}, Pincode: ${pd.currentPincode || ''}`);
  doc.moveDown();
  
  doc.text(`PAN Number: ${pd.panNumber || ''}`);
  doc.text(`Aadhaar Number: ${pd.aadhaarNumber || ''}`);
  doc.moveDown();
  
  doc.text(`Bank Name: ${pd.bankName || ''}`);
  doc.text(`Account Number: ${pd.bankAccountNumber || ''}`);
  doc.text(`IFSC Code: ${pd.ifscCode || ''}`);
};

const generateMedicalFormPdf = (doc, data) => {
  const pd = data.profileData || {};
  
  doc.fontSize(16).text('MEDICAL INSURANCE FORM', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('ESME CONSUMER (P) LTD', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(10);
  doc.text(`Employee Name: ${pd.fullName || data.name || ''}`);
  doc.text(`Employee Code: ${pd.employeeCode || ''}`);
  doc.text(`Date of Birth: ${pd.dateOfBirth || ''}`);
  doc.text(`Blood Group: ${pd.bloodGroup || ''}`);
  doc.text(`Marital Status: ${pd.maritalStatus || ''}`);
  doc.moveDown();
  
  doc.text(`Emergency Contact: ${pd.emergencyContactName || ''}`);
  doc.text(`Relation: ${pd.emergencyContactRelation || ''}`);
  doc.text(`Mobile: ${pd.emergencyContactMobile || ''}`);
  doc.moveDown();
  
  doc.text('Declaration:', { underline: true });
  doc.text('I hereby declare that the information provided above is true and correct to the best of my knowledge.');
  doc.moveDown(2);
  
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.text('Signature: _____________________');
};

const generateSelfDeclarationPdf = (doc, data) => {
  const pd = data.profileData || {};
  
  doc.fontSize(16).text('SELF DECLARATION FORM', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('ESME CONSUMER (P) LTD', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(10);
  doc.text(`I, ${pd.fullName || data.name || ''}, hereby declare that:`);
  doc.moveDown();
  
  doc.text('1. All information provided in my employment application is true and accurate.');
  doc.text('2. I have not withheld any information that may affect my employment.');
  doc.text('3. I understand that false information may result in termination.');
  doc.text('4. I agree to abide by all company policies and procedures.');
  doc.moveDown(2);
  
  doc.text(`Employee Name: ${pd.fullName || data.name || ''}`);
  doc.text(`Employee Code: ${pd.employeeCode || ''}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();
  doc.text('Signature: _____________________');
};

const generateForm11Pdf = (doc, data) => {
  const pd = data.profileData || {};
  
  doc.fontSize(16).text('FORM 11 - DECLARATION AND NOMINATION', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('(Under EPF Scheme 1952)', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(10);
  doc.text(`Name: ${pd.fullName || data.name || ''}`);
  doc.text(`Father's/Husband's Name: ${pd.fatherName || ''}`);
  doc.text(`Date of Birth: ${pd.dateOfBirth || ''}`);
  doc.text(`Account Number (if previous): ${pd.previousPFNumber || 'New Account'}`);
  doc.moveDown();
  
  doc.text('NOMINATION FOR PROVIDENT FUND:', { underline: true });
  doc.text(`Nominee Name: ${pd.emergencyContactName || ''}`);
  doc.text(`Relationship: ${pd.emergencyContactRelation || ''}`);
  doc.text(`Date of Birth of Nominee: ${'Not Provided'}`);
  doc.moveDown();
  
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.text('Signature of Member: _____________________');
};

const generateFormFPdf = (doc, data) => {
  const pd = data.profileData || {};
  
  doc.fontSize(16).text('FORM F - NOMINATION FOR GRATUITY', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('ESME CONSUMER (P) LTD', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(10);
  doc.text(`Name of Employee: ${pd.fullName || data.name || ''}`);
  doc.text(`Sex: ${pd.gender || ''}`);
  doc.text(`Religion: ${pd.religion || ''}`);
  doc.text(`Marital Status: ${pd.maritalStatus || ''}`);
  doc.text(`Department: ${pd.department || ''}`);
  doc.moveDown();
  
  doc.text('NOMINATION:', { underline: true });
  doc.text(`I nominate the following person(s) for receiving gratuity:`);
  doc.moveDown();
  doc.text(`Name: ${pd.emergencyContactName || ''}`);
  doc.text(`Relationship: ${pd.emergencyContactRelation || ''}`);
  doc.text(`Age: ${'Not Provided'}`);
  doc.text(`Share: 100%`);
  doc.moveDown(2);
  
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.text('Signature: _____________________');
};

const generatePFNominationPdf = (doc, data) => {
  const pd = data.profileData || {};
  
  doc.fontSize(16).text('PF NOMINATION FORM', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('ESME CONSUMER (P) LTD', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(10);
  doc.text(`Employee Name: ${pd.fullName || data.name || ''}`);
  doc.text(`UAN Number: ${pd.uanNumber || 'To be assigned'}`);
  doc.text(`PF Number: ${pd.previousPFNumber || 'New'}`);
  doc.moveDown();
  
  doc.text('FAMILY DETAILS:', { underline: true });
  doc.text(`Father: ${pd.fatherName || ''}`);
  doc.text(`Mother: ${pd.motherName || ''}`);
  if (pd.spouseName) {
    doc.text(`Spouse: ${pd.spouseName}`);
  }
  doc.moveDown();
  
  doc.text('NOMINEE DETAILS:', { underline: true });
  doc.text(`Name: ${pd.emergencyContactName || ''}`);
  doc.text(`Relationship: ${pd.emergencyContactRelation || ''}`);
  doc.moveDown(2);
  
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.text('Signature: _____________________');
};

const generatePolicyAcknowledgmentPdf = (doc, data) => {
  const pd = data.profileData || {};
  
  doc.fontSize(16).text('POLICY ACKNOWLEDGMENT & DECLARATION', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('ESME CONSUMER (P) LTD', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(11).text('Employee Information', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10);
  doc.text(`Name: ${pd.fullName || data.name || ''}`);
  doc.text(`Employee Code: ${pd.employeeCode || 'N/A'}`);
  doc.text(`Department: ${pd.department || pd.division || 'N/A'}`);
  doc.text(`Designation: ${pd.designation || 'N/A'}`);
  doc.text(`Date of Joining: ${pd.dateOfJoining || 'N/A'}`);
  doc.moveDown();
  
  doc.fontSize(11).text('POLICY ACKNOWLEDGMENT', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10).text('I hereby acknowledge and confirm that:', { bold: true });
  doc.moveDown(0.5);
  
  const acknowledgments = [
    'I have received, accessed, and carefully read the complete "ESME Company Policies" document provided to me during the onboarding process.',
    'I have had sufficient opportunity to review all company policies, procedures, and guidelines contained in the policies document.',
    'I understand all the policies, rules, regulations, and expectations outlined in the company policies document.',
    'I agree to comply with and abide by all policies, procedures, and guidelines set forth by ESME Consumer (P) Ltd.',
    'I understand that violation of any company policy may result in disciplinary action, up to and including termination of employment.',
    'I acknowledge that the company reserves the right to modify, amend, or update policies at any time, and I will be notified of any such changes.',
    'I understand that my continued employment is contingent upon my compliance with all company policies and procedures.'
  ];
  
  acknowledgments.forEach((ack, index) => {
    doc.text(`${index + 1}. ${ack}`, { width: 500 });
    doc.moveDown(0.3);
  });
  
  doc.moveDown();
  doc.fontSize(11).text('DECLARATION', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10);
  doc.text('I hereby declare that:', { bold: true });
  doc.moveDown(0.3);
  doc.text('• I have read and understood all the company policies and guidelines provided in the ESME Company Policies document.');
  doc.text('• I agree to comply with all Company policies, procedures, and standards during my employment.');
  doc.text('• I understand that violation of any policy may result in disciplinary action, including termination of employment.');
  doc.text('• All information provided by me in my employment application and documents is true and accurate to the best of my knowledge.');
  
  doc.moveDown(2);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`);
  doc.text('Employee Signature: _____________________');
  doc.moveDown();
  doc.text(`Employee Name: ${pd.fullName || data.name || ''}`);
  doc.text(`Employee Code: ${pd.employeeCode || 'N/A'}`);
};

const generateChecklistPdf = (doc, data) => {
  const pd = data.profileData || {};
  
  doc.fontSize(16).text('DOCUMENT CHECKLIST', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('ESME CONSUMER (P) LTD', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(10);
  doc.text(`Candidate Name: ${pd.fullName || data.name || ''}`);
  doc.text(`Employee Code: ${pd.employeeCode || ''}`);
  doc.text(`Department: ${pd.department || ''}`);
  doc.moveDown();
  
  doc.text('REQUIRED DOCUMENTS:', { underline: true });
  doc.moveDown();
  
  const documents = [
    'Aadhaar Card',
    'PAN Card',
    'Passport Size Photograph',
    'Educational Certificates',
    'Experience Letters',
    'Cancelled Cheque',
    'Previous Employment Documents',
    'Address Proof',
    'Medical Fitness Certificate'
  ];
  
  documents.forEach((docName) => {
    doc.text(`☐ ${docName}`);
  });
  
  doc.moveDown(2);
  doc.text('HR Verification:');
  doc.text('Signature: _____________________');
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
};

export const generateAndUploadAllPdfs = async (user) => {
  try {
    console.log(`📄 Generating PDFs for ${user.name || user.email}...`);

    if (!user.driveFolder?.folderId) {
      throw new Error('Candidate folder not created in Google Drive');
    }

    const generatedSubfolder = await createSubfolder(user.driveFolder.folderId, 'generated');
    
    const pdfGenerators = [
      { key: 'joiningForm', fileName: 'Joining_Form.pdf', generator: generateJoiningFormPdf },
      { key: 'medicalForm', fileName: 'Medical_Insurance_Form.pdf', generator: generateMedicalFormPdf },
      { key: 'selfDeclaration', fileName: 'Self_Declaration.pdf', generator: generateSelfDeclarationPdf },
      { key: 'form11', fileName: 'Form_11.pdf', generator: generateForm11Pdf },
      { key: 'formF', fileName: 'Form_F.pdf', generator: generateFormFPdf },
      { key: 'pfNomination', fileName: 'PF_Nomination.pdf', generator: generatePFNominationPdf },
      { key: 'policyAcknowledgment', fileName: 'Policy_Acknowledgment.pdf', generator: generatePolicyAcknowledgmentPdf },
      { key: 'checklist', fileName: 'Document_Checklist.pdf', generator: generateChecklistPdf }
    ];

    const generatedDocs = {};

    for (const { key, fileName, generator } of pdfGenerators) {
      try {
        const pdfBuffer = await generatePdfBuffer(generator, user);
        const uploadResult = await uploadOrReplacePdf(generatedSubfolder.folderId, pdfBuffer, fileName);
        
        generatedDocs[key] = {
          fileId: uploadResult.fileId,
          fileName: uploadResult.fileName,
          viewLink: uploadResult.viewLink,
          downloadLink: uploadResult.downloadLink,
          generatedAt: new Date()
        };
        
        console.log(`✅ Generated and uploaded: ${fileName}`);
      } catch (error) {
        console.error(`❌ Error generating ${fileName}:`, error.message);
      }
    }

    return {
      generatedSubfolderId: generatedSubfolder.folderId,
      generatedDocuments: generatedDocs
    };
  } catch (error) {
    console.error('❌ Error in generateAndUploadAllPdfs:', error.message);
    throw error;
  }
};

export default { generateAndUploadAllPdfs };
