import { ESME_LOGO_BASE64 } from '../constants/esmeLogoBase64.js';

export const generateMedicalInsuranceFormPDF = async (candidate) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 8;
  const margin = 12;
  const addSectionTitle = (title) => {
    yPosition += 2;
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.setFillColor(30, 70, 120);
    doc.rect(margin - 2, yPosition - 4.5, pageWidth - 2 * margin + 4, 6, 'F');
    doc.text(title, margin + 2, yPosition);
    yPosition += 8;
  };
  const addField = (label, value) => {
    doc.setFontSize(8);
    doc.setTextColor(60, 80, 100);
    doc.setFont(undefined, 'bold');
    doc.text(label + ':', margin, yPosition);
    doc.setFontSize(9);
    doc.setTextColor(20, 30, 50);
    doc.setFont(undefined, 'normal');
    const displayValue = value || '_________________________________________________';
    const lines = doc.splitTextToSize(displayValue.toString(), pageWidth - 2 * margin - 45);
    doc.text(lines, margin + 40, yPosition);
    yPosition += 6;
  };
  const addTwoColumnFields = (label1, value1, label2, value2) => {
    const col1X = margin;
    const col2X = (pageWidth / 2) + 2;
    const labelWidth = 25;
    doc.setFontSize(8);
    doc.setTextColor(60, 80, 100);
    doc.setFont(undefined, 'bold');
    doc.text(label1 + ':', col1X, yPosition);
    doc.text(label2 + ':', col2X, yPosition);
    doc.setFontSize(9);
    doc.setTextColor(20, 30, 50);
    doc.setFont(undefined, 'normal');
    const val1 = value1 || '___________________';
    const val2 = value2 || '___________________';
    doc.text(val1.toString().substring(0, 25), col1X + labelWidth, yPosition);
    doc.text(val2.toString().substring(0, 22), col2X + labelWidth, yPosition);
    yPosition += 6;
  };
  const checkPageBreak = (height = 15) => {
    if (yPosition + height > pageHeight - 15) {
      doc.addPage();
      yPosition = 10;
    }
  };

  // --- Header with REAL Logo ---
  const logoY = 12;
  try {
    doc.addImage(ESME_LOGO_BASE64, 'PNG', margin, logoY, 40, 15, undefined, 'FAST');
  } catch (e) { }

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('MEDICAL INSURANCE FORM', pageWidth - margin, logoY + 10, { align: 'right' });

  // Line
  doc.setDrawColor(0, 128, 128);
  doc.setLineWidth(0.5);
  doc.line(margin, logoY + 18, pageWidth - margin, logoY + 18);

  yPosition = 35;

  addSectionTitle('EMPLOYEE INFORMATION');
  checkPageBreak(25);
  addField('Employee Name', candidate.profileData?.employeeName || candidate.name || '-');
  addField('Employee Code', candidate.profileData?.employeeCode || '-');
  addTwoColumnFields('Department', candidate.profileData?.department || '-', 'Date of Joining', candidate.profileData?.dateOfJoining || '-');
  addTwoColumnFields('Email', candidate.profileData?.emailId || candidate.email || '-', 'Contact Number', candidate.profileData?.contactNumber || candidate.mobile || '-');
  addField('Marital Status', candidate.profileData?.maritalStatus || '-');

  checkPageBreak(30);
  addSectionTitle('SPOUSE DETAILS');
  addTwoColumnFields('Spouse Name', candidate.profileData?.spouseName || '-', 'Date of Birth', candidate.profileData?.spouseDOB || '-');

  checkPageBreak(30);
  addSectionTitle('PARENTS DETAILS');
  addTwoColumnFields('Father Name', candidate.profileData?.fatherName || '-', 'Father DOB', candidate.profileData?.fatherDOB || '-');
  addTwoColumnFields('Mother Name', candidate.profileData?.motherName || '-', 'Mother DOB', candidate.profileData?.motherDOB || '-');

  // Children Details
  if (candidate.profileData?.childrenDetails && candidate.profileData.childrenDetails.length > 0) {
    checkPageBreak(30);
    addSectionTitle('CHILDREN DETAILS');
    candidate.profileData.childrenDetails.forEach((child, index) => {
      addTwoColumnFields(`Child ${index + 1} Name`, child.name || '-', 'Date of Birth', child.dob || '-');
      addField('Gender', child.gender || '-');
    });
  }

  checkPageBreak(25);
  addSectionTitle('DECLARATION');
  yPosition += 2;
  doc.setFontSize(8);
  doc.setTextColor(20, 30, 50);
  const declarationText = `I declare that the information provided above is true and accurate to the best of my knowledge. I understand that any false information may result in rejection of insurance claims.`;
  const wrappedDecl = doc.splitTextToSize(declarationText, pageWidth - 2 * margin - 5);
  doc.text(wrappedDecl, margin, yPosition);
  yPosition += wrappedDecl.length * 4 + 8;
  checkPageBreak(15);

  // Ensure enough space for signature image above
  if (yPosition < 40) yPosition = 40;

  yPosition += 3;

  if (candidate.signature) {
    try {
      // Auto-detect format from data URI
      doc.addImage(candidate.signature, margin, yPosition - 15, 40, 15);
    } catch (error) {
      console.warn('Auto-detect signature format failed, retrying as PNG:', error);
      try {
        doc.addImage(candidate.signature, 'PNG', margin, yPosition - 15, 40, 15);
      } catch (e2) {
        console.error('Error adding signature:', e2);
      }
    }
  }

  doc.setDrawColor(100);
  doc.line(margin, yPosition, margin + 35, yPosition);
  doc.setFontSize(8);
  doc.text('Signature', margin + 2, yPosition + 4);
  doc.line(pageWidth - margin - 35, yPosition, pageWidth - margin, yPosition);
  doc.text('Date', pageWidth - margin - 20, yPosition + 4);
  const footerY = pageHeight - 8;
  doc.setFontSize(7);
  doc.setTextColor(120, 130, 140);
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Esme Consumer`, margin, footerY);
  return doc;
};
export const downloadMedicalInsuranceFormPDF = async (candidate) => {
  const doc = await generateMedicalInsuranceFormPDF(candidate);
  const fileName = `${candidate.name}_Medical_Insurance_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  if (candidate.email) {
    try {
      const { uploadPdfToDrive } = await import('./driveUpload.js');
      const pdfBlob = doc.output('blob');
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      const result = await uploadPdfToDrive(candidate.email, pdfBytes, 'Medical_Insurance_Form', fileName);
      if (result.success) {
        console.log('✅ Medical Insurance Form uploaded to Google Drive');
      }
    } catch (err) {
      console.log('⚠️ Drive upload skipped:', err.message);
    }
  }
};
