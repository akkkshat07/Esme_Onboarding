import { ESME_LOGO_BASE64 } from '../constants/esmeLogoBase64.js';

export const generateSelfDeclarationFormPDF = async (candidate) => {
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
  const addDeclaration = (number, text) => {
    checkPageBreak(12);
    doc.setFontSize(9);
    doc.setTextColor(20, 30, 50);
    doc.setFont(undefined, 'bold');
    doc.text(`${number}.`, margin, yPosition);
    doc.setFont(undefined, 'normal');
    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin - 8);
    doc.text(lines, margin + 5, yPosition);
    yPosition += lines.length * 4 + 3;
  };
  const checkPageBreak = (height = 15) => {
    if (yPosition + height > pageHeight - 20) {
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
  doc.text('SELF DECLARATION FORM', pageWidth - margin, logoY + 10, { align: 'right' });

  // Line
  doc.setDrawColor(0, 128, 128);
  doc.setLineWidth(0.5);
  doc.line(margin, logoY + 18, pageWidth - margin, logoY + 18);

  yPosition = 35;
  addSectionTitle('PERSONAL INFORMATION');
  checkPageBreak(20);
  doc.setFontSize(9);
  doc.setTextColor(60, 80, 100);
  doc.setFont(undefined, 'bold');
  doc.text('Full Name:', margin, yPosition);
  doc.setFontSize(9);
  doc.setTextColor(20, 30, 50);
  doc.setFont(undefined, 'normal');
  doc.text(candidate.name || '__________________________________________', margin + 35, yPosition);
  yPosition += 7;
  doc.setTextColor(60, 80, 100);
  doc.setFont(undefined, 'bold');
  doc.text('Date of Birth:', margin, yPosition);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(20, 30, 50);
  doc.text(candidate.profileData?.dob || candidate.profileData?.dateOfBirth || candidate.dob || candidate.dateOfBirth || '__________________________________________', margin + 35, yPosition);
  yPosition += 7;
  doc.setTextColor(60, 80, 100);
  doc.setFont(undefined, 'bold');
  doc.text('Email:', margin, yPosition);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(20, 30, 50);
  doc.text(candidate.email || '__________________________________________', margin + 35, yPosition);
  yPosition += 7;
  doc.setTextColor(60, 80, 100);
  doc.setFont(undefined, 'bold');
  doc.text('Mobile:', margin, yPosition);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(20, 30, 50);
  doc.text(candidate.mobile || candidate.mobileNumber || candidate.phone || candidate.profileData?.mobile || '__________________________________________', margin + 35, yPosition);
  yPosition += 10;
  addSectionTitle('DECLARATIONS');
  yPosition += 2;
  // Consolidated Declaration Paragraph
  const candidateName = candidate.name || 'Candidate';
  const declarationText = `I, ${candidateName}, hereby declare that the information provided in this Self Declaration Form, as well as in Form F, Form 11, PF Form, Employee Joining Form, Medical Insurance Form, and Policy Acknowledgment, is true and correct to the best of my knowledge and belief. I have disclosed all material facts relating to my past medical history, if any, and declare that I am not suffering from any communicable disease nor have I been treated for any serious illness in the past. I further declare that I am not addicted to alcohol, drugs, or any controlled substance. I confirm that all documents submitted by me are genuine and have not been forged or altered in any manner. I acknowledge that any false declaration made in any of these forms may result in disciplinary action or termination of employment. I have read and understood all the terms and conditions of employment with Esme Consumer (P) Ltd.`;

  checkPageBreak(40);
  doc.setFontSize(9);
  doc.setTextColor(20, 30, 50);
  doc.setFont(undefined, 'normal');
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
  doc.setFont(undefined, 'normal');
  doc.setTextColor(60, 80, 100);
  doc.text('Employee Signature', margin + 2, yPosition + 4);
  doc.line(pageWidth - margin - 35, yPosition, pageWidth - margin, yPosition);
  doc.text('Date', pageWidth - margin - 20, yPosition + 4);
  const footerY = pageHeight - 8;
  doc.setFontSize(7);
  doc.setTextColor(120, 130, 140);
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Esme Consumer`, margin, footerY);
  return doc;
};
export const downloadSelfDeclarationFormPDF = async (candidate) => {
  const doc = await generateSelfDeclarationFormPDF(candidate);
  const fileName = `${candidate.name}_Self_Declaration_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  if (candidate.email) {
    try {
      const { uploadPdfToDrive } = await import('./driveUpload.js');
      const pdfBlob = doc.output('blob');
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      const result = await uploadPdfToDrive(candidate.email, pdfBytes, 'Self_Declaration_Form', fileName);
      if (result.success) {
        console.log('✅ Self Declaration Form uploaded to Google Drive');
      }
    } catch (err) {
      console.log('⚠️ Drive upload skipped:', err.message);
    }
  }
};
