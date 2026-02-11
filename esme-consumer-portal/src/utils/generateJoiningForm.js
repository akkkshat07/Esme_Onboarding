import { uploadPdfToDrive } from './driveUpload';
export const generateJoiningFormPDF = async (candidate) => {
  const jsPDF = (await import('jspdf')).default;
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 10;
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  const primaryColor = [0, 128, 128];
  const darkColor = [30, 41, 59];
  const grayColor = [100, 116, 139];
  const addHeader = () => {
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setFontSize(18);
    doc.setTextColor(...primaryColor);
    doc.setFont(undefined, 'bold');
    doc.text('ESME CONSUMER (P) LTD.', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(...darkColor);
    doc.text('EMPLOYEE JOINING FORM', pageWidth / 2, 24, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.setFont(undefined, 'normal');
    doc.text('Date: ' + new Date().toLocaleDateString('en-IN'), pageWidth - margin, 30, { align: 'right' });
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.8);
    doc.line(margin, 36, pageWidth - margin, 36);
    yPosition = 42;
  };
  const addSectionHeader = (title) => {
    checkPageBreak(12);
    yPosition += 4;
    doc.setFillColor(...primaryColor);
    doc.roundedRect(margin, yPosition - 5, contentWidth, 8, 1, 1, 'F');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text(title, margin + 4, yPosition);
    yPosition += 8;
  };
  const addFieldRow = (label1, value1, label2, value2) => {
    checkPageBreak(10);
    const col1X = margin;
    const col2X = pageWidth / 2 + 5;
    const labelWidth = 38;
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.setFont(undefined, 'bold');
    doc.text(label1 + ':', col1X, yPosition);
    doc.setFontSize(9);
    doc.setTextColor(...darkColor);
    doc.setFont(undefined, 'normal');
    const val1 = value1 || '-';
    doc.text(String(val1).substring(0, 28), col1X + labelWidth, yPosition);
    doc.setDrawColor(200, 210, 220);
    doc.setLineWidth(0.3);
    doc.line(col1X + labelWidth, yPosition + 1, col2X - 10, yPosition + 1);
    if (label2) {
      doc.setFontSize(8);
      doc.setTextColor(...grayColor);
      doc.setFont(undefined, 'bold');
      doc.text(label2 + ':', col2X, yPosition);
      doc.setFontSize(9);
      doc.setTextColor(...darkColor);
      doc.setFont(undefined, 'normal');
      const val2 = value2 || '-';
      doc.text(String(val2).substring(0, 25), col2X + labelWidth, yPosition);
      doc.line(col2X + labelWidth, yPosition + 1, pageWidth - margin, yPosition + 1);
    }
    yPosition += 8;
  };
  const addFullWidthField = (label, value) => {
    checkPageBreak(10);
    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.setFont(undefined, 'bold');
    doc.text(label + ':', margin, yPosition);
    doc.setFontSize(9);
    doc.setTextColor(...darkColor);
    doc.setFont(undefined, 'normal');
    const displayValue = value || '-';
    const lines = doc.splitTextToSize(String(displayValue), contentWidth - 45);
    doc.text(lines, margin + 42, yPosition);
    doc.setDrawColor(200, 210, 220);
    doc.setLineWidth(0.3);
    doc.line(margin + 42, yPosition + 1, pageWidth - margin, yPosition + 1);
    yPosition += lines.length > 1 ? (lines.length * 5 + 3) : 8;
  };
  const checkPageBreak = (requiredHeight = 20) => {
    if (yPosition + requiredHeight > pageHeight - 20) {
      addFooter();
      doc.addPage();
      yPosition = 15;
      addPageHeader();
    }
  };
  const addPageHeader = () => {
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.setFont(undefined, 'bold');
    doc.text('ESME CONSUMER (P) LTD. - Employee Joining Form', margin, 10);
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(margin, 12, pageWidth - margin, 12);
    yPosition = 18;
  };
  const addFooter = () => {
    const footerY = pageHeight - 8;
    doc.setFontSize(7);
    doc.setTextColor(...grayColor);
    doc.text('This is a computer-generated document.', margin, footerY);
    doc.text('Page ' + doc.internal.getNumberOfPages(), pageWidth - margin, footerY, { align: 'right' });
  };
  const profile = candidate.profileData || {};
  const formatGender = (g) => g === 'M' ? 'Male' : g === 'F' ? 'Female' : g || '-';
  addHeader();
  addSectionHeader('PERSONAL DETAILS');
  addFieldRow('Full Name', profile.fullName || candidate.name, 'Date of Birth', profile.dateOfBirth);
  addFieldRow('Gender', formatGender(profile.gender), 'Age', profile.age);
  addFieldRow("Father's Name", profile.fatherName, 'Blood Group', profile.bloodGroup);
  addFieldRow('Marital Status', profile.maritalStatus, 'Nationality', 'Indian');
  addFieldRow('Mobile Number', profile.mobileNumber || candidate.mobile, 'Alternate Mobile', profile.alternateMobileNumber);
  addFullWidthField('Email Address', profile.email || candidate.email);
  addSectionHeader('ADDRESS DETAILS');
  addFullWidthField('Current Address', profile.currentAddress);
  addFieldRow('Current City', profile.currentCity, 'Pincode', profile.pincode);
  addFullWidthField('Permanent Address', profile.permanentAddress);
  addSectionHeader('IDENTITY & VERIFICATION');
  addFieldRow('Aadhaar Number', profile.aadhaarNumber, 'PAN Number', profile.panNumber);
  addFieldRow('UAN Number', profile.uanNumber || 'To be allotted', 'Passport Number', profile.passportNumber);
  addSectionHeader('BANK ACCOUNT DETAILS');
  addFieldRow('Bank Name', profile.bankName, 'Branch', '-');
  addFieldRow('Account Number', profile.accountNumber, 'IFSC Code', profile.ifscCode);
  addFullWidthField('Account Holder Name', profile.accountHolderName || profile.fullName || candidate.name);
  addSectionHeader('EMPLOYMENT DETAILS');
  addFieldRow('Designation', candidate.designation || profile.profession, 'Department', profile.department);
  addFieldRow('Date of Joining', profile.dateOfJoining, 'Entity', profile.entity || 'Esme Consumer (P) Ltd.');
  addFieldRow('Employee ID', candidate.employeeId || 'To be assigned', 'Location', profile.currentCity);
  addSectionHeader('EMERGENCY CONTACT');
  addFieldRow('Contact Name', profile.emergencyContactName, 'Relationship', profile.emergencyContactRelation);
  addFieldRow('Contact Number', profile.emergencyContactNumber, '', '');
  addSectionHeader('FAMILY & NOMINEE DETAILS');
  addFieldRow('Spouse Name', profile.spouseName || 'N/A', '', '');
  addFieldRow('Nominee Name', profile.nomineeName, 'Relationship', profile.nomineeRelationship);
  addFieldRow('Nominee DOB', profile.nomineeDOB, 'Share %', '100%');
  checkPageBreak(50);
  addSectionHeader('DECLARATION');
  yPosition += 2;
  doc.setFontSize(9);
  doc.setTextColor(...darkColor);
  doc.setFont(undefined, 'normal');
  const candidateName = profile.fullName || candidate.name || 'the undersigned';
  const declaration = 'I, ' + candidateName + ', hereby declare that all the information provided above is true and correct to the best of my knowledge and belief. I understand that if any information is found to be false or incorrect at any time during my employment, my services may be terminated without any notice. I also declare that I have read and understood all the company policies and agree to abide by them.';
  const declLines = doc.splitTextToSize(declaration, contentWidth - 5);
  doc.text(declLines, margin + 2, yPosition);
  yPosition += declLines.length * 5 + 10;
  checkPageBreak(30);
  yPosition += 5;
  const sigBoxWidth = 60;
  const sigBoxHeight = 20;
  doc.setDrawColor(...grayColor);
  doc.setLineWidth(0.3);
  doc.rect(margin, yPosition, sigBoxWidth, sigBoxHeight);
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('Employee Signature', margin + 5, yPosition + sigBoxHeight + 4);
  doc.rect(margin + sigBoxWidth + 20, yPosition, sigBoxWidth, sigBoxHeight);
  doc.text('Date', margin + sigBoxWidth + 25, yPosition + sigBoxHeight + 4);
  doc.rect(pageWidth - margin - sigBoxWidth, yPosition, sigBoxWidth, sigBoxHeight);
  doc.text('HR Signature & Stamp', pageWidth - margin - sigBoxWidth + 5, yPosition + sigBoxHeight + 4);
  yPosition = pageHeight - 15;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition - 5, pageWidth - margin, yPosition - 5);
  doc.setFontSize(7);
  doc.setTextColor(...grayColor);
  doc.text('ESME Consumer (P) Ltd. | Confidential Document', margin, yPosition);
  doc.text('Generated on: ' + new Date().toLocaleString('en-IN'), pageWidth - margin, yPosition, { align: 'right' });
  return doc;
};
export const downloadJoiningFormPDF = async (candidate) => {
  const doc = await generateJoiningFormPDF(candidate);
  const candidateName = candidate.name ? candidate.name.replace(/\s+/g, '_') : 'Candidate';
  const fileName = candidateName + '_Joining_Form_' + new Date().toISOString().split('T')[0] + '.pdf';
  doc.save(fileName);
  if (candidate.email) {
    try {
      const pdfBlob = doc.output('blob');
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      const result = await uploadPdfToDrive(candidate.email, pdfBytes, 'Employee_Joining_Form', fileName);
      if (result.success) {
        console.log('✅ Joining Form uploaded to Google Drive');
      }
    } catch (err) {
      console.log('⚠️ Drive upload skipped:', err.message);
    }
  }
};
