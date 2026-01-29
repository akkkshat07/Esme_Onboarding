export const generateMedicalInsuranceFormPDF = async (candidate) => {
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

  doc.setFontSize(18);
  doc.setTextColor(20, 40, 80);
  doc.setFont(undefined, 'bold');
  doc.text('MEDICAL INSURANCE FORM', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;
  doc.setFontSize(9);
  doc.setTextColor(80, 100, 120);
  doc.setFont(undefined, 'normal');
  doc.text('Esme Consumer (P) Ltd.', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  addSectionTitle('EMPLOYEE INFORMATION');
  checkPageBreak(25);
  addTwoColumnFields('Full Name', candidate.name, 'Date of Birth', candidate.profileData?.dob);
  addTwoColumnFields('Email', candidate.email, 'Mobile', candidate.mobile);
  addField('Current Address', candidate.profileData?.address);

  checkPageBreak(30);
  addSectionTitle('HEALTH INFORMATION');
  doc.setFontSize(8);
  doc.setTextColor(60, 80, 100);
  doc.text('Please check all that apply:', margin, yPosition);
  yPosition += 5;

  const healthConditions = ['Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Thyroid Issues', 'Other Allergies'];
  healthConditions.forEach((condition) => {
    doc.setTextColor(20, 30, 50);
    doc.rect(margin + 2, yPosition - 2.5, 3.5, 3.5);
    doc.text('☐ ' + condition, margin + 8, yPosition);
    yPosition += 5;
  });

  checkPageBreak(30);
  addSectionTitle('NOMINEE INFORMATION');
  addField('Nominee Name', candidate.profileData?.emergencyContact);
  addTwoColumnFields('Relation', candidate.profileData?.emergencyRelation, 'Contact No.', '');
  addField('Address', candidate.profileData?.address);

  checkPageBreak(25);
  addSectionTitle('DECLARATION');
  yPosition += 2;
  doc.setFontSize(8);
  doc.setTextColor(20, 30, 50);
  const declarationText = `I declare that the information provided is true and accurate. Any false information may result in rejection of insurance claims.`;
  const wrappedDecl = doc.splitTextToSize(declarationText, pageWidth - 2 * margin - 5);
  doc.text(wrappedDecl, margin, yPosition);
  yPosition += wrappedDecl.length * 4 + 8;

  checkPageBreak(15);
  yPosition += 3;
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
};
