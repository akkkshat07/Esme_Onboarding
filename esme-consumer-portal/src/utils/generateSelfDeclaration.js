import { uploadPdfToDrive } from './driveUpload';

export const generateSelfDeclarationFormPDF = async (candidate) => {
  const jsPDF = (await import('jspdf')).default;
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

  doc.setFontSize(18);
  doc.setTextColor(20, 40, 80);
  doc.setFont(undefined, 'bold');
  doc.text('SELF DECLARATION FORM', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;
  doc.setFontSize(9);
  doc.setTextColor(80, 100, 120);
  doc.setFont(undefined, 'normal');
  doc.text('Esme Consumer (P) Ltd.', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

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
  doc.text(candidate.profileData?.dob || '__________________________________________', margin + 35, yPosition);
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
  doc.text(candidate.mobile || '__________________________________________', margin + 35, yPosition);
  yPosition += 10;

  addSectionTitle('DECLARATIONS');
  yPosition += 2;

  addDeclaration('1', 'I declare that the information provided in this form is true and correct to the best of my knowledge and belief.');
  addDeclaration('2', 'I hereby declare that I have disclosed all material facts relating to my past medical history, if any.');
  addDeclaration('3', 'I declare that I am not suffering from any communicable disease and have not been treated for any serious illness in the past.');
  addDeclaration('4', 'I hereby declare that I am not addicted to alcohol, drugs, or any controlled substance.');
  addDeclaration('5', 'I declare that all documents submitted by me are genuine and have not been forged or altered in any manner.');
  addDeclaration('6', 'I acknowledge that any false declaration made in this form may result in disciplinary action or termination of employment.');
  addDeclaration('7', 'I declare that I have read and understood all the terms and conditions of employment with Esme Consumer (P) Ltd.');

  checkPageBreak(30);
  yPosition += 5;
  doc.setFontSize(9);
  doc.setTextColor(20, 30, 50);
  doc.setFont(undefined, 'bold');
  doc.text('Employee Acknowledgment:', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  const ackText = 'I hereby acknowledge that I have read, understood, and agree to the terms and conditions mentioned in this Self Declaration Form. I take full responsibility for the accuracy and truthfulness of the information provided herein.';
  const wrappedText = doc.splitTextToSize(ackText, pageWidth - 2 * margin - 5);
  doc.text(wrappedText, margin, yPosition);
  yPosition += wrappedText.length * 3.5 + 6;

  checkPageBreak(15);
  yPosition += 3;
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
  
  // Upload to Google Drive if email available
  if (candidate.email) {
    try {
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
