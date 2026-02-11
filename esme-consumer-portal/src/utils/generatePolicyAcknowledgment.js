import { jsPDF } from 'jspdf';

export const generatePolicyAcknowledgment = (candidateData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPos = 20;

  const addText = (text, x, y, options = {}) => {
    doc.setFontSize(options.fontSize || 10);
    doc.setFont(options.font || 'helvetica', options.fontStyle || 'normal');
    doc.text(text, x, y, options);
  };

  const checkPageBreak = (increment = 10) => {
    if (yPos + increment > doc.internal.pageSize.height - 20) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  // Header
  doc.setFillColor(0, 51, 102);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  addText('ESME CONSUMER (P) LTD', pageWidth / 2, 15, {
    fontSize: 16,
    fontStyle: 'bold',
    font: 'helvetica',
    align: 'center'
  });
  addText('POLICY ACKNOWLEDGMENT & DECLARATION', pageWidth / 2, 22, {
    fontSize: 12,
    align: 'center'
  });
  doc.setTextColor(0, 0, 0);

  yPos = 45;

  // Employee Information
  addText('Employee Information', margin, yPos, { fontSize: 12, fontStyle: 'bold' });
  yPos += 8;

  const employeeInfo = [
    ['Name:', candidateData.profileData?.fullName || candidateData.name],
    ['Employee Code:', candidateData.profileData?.employeeCode || 'N/A'],
    ['Department:', candidateData.profileData?.department || candidateData.profileData?.division || 'N/A'],
    ['Designation:', candidateData.profileData?.designation || 'N/A'],
    ['Date of Joining:', candidateData.profileData?.dateOfJoining || 'N/A']
  ];

  employeeInfo.forEach(([label, value]) => {
    checkPageBreak();
    addText(label, margin, yPos, { fontStyle: 'bold' });
    addText(value, margin + 40, yPos);
    yPos += 6;
  });

  yPos += 5;
  checkPageBreak(15);
  doc.setDrawColor(0, 51, 102);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Policy Acknowledgment Section
  addText('POLICY ACKNOWLEDGMENT', margin, yPos, { fontSize: 12, fontStyle: 'bold' });
  yPos += 10;

  checkPageBreak(20);
  addText('I hereby acknowledge and confirm that:', margin, yPos, { fontStyle: 'bold' });
  yPos += 8;

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
    checkPageBreak(15);
    const bulletPoint = `${index + 1}.`;
    const wrappedText = doc.splitTextToSize(ack, pageWidth - 2 * margin - 15);
    addText(bulletPoint, margin + 5, yPos);
    wrappedText.forEach((line, lineIndex) => {
      if (lineIndex > 0) checkPageBreak(6);
      addText(line, margin + 15, yPos);
      yPos += 6;
    });
    yPos += 2;
  });

  yPos += 10;
  checkPageBreak(30);
  doc.setDrawColor(0, 51, 102);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Declaration Section
  addText('DECLARATION', margin, yPos, { fontSize: 12, fontStyle: 'bold' });
  yPos += 10;

  const declaration = [
    'I hereby declare that:',
    '',
    '• I have read and understood all the company policies and guidelines provided in the ESME Company Policies document.',
    '• I agree to comply with all Company policies, procedures, and standards during my employment.',
    '• I understand that violation of any policy may result in disciplinary action, including termination of employment.',
    '• All information provided by me in my employment application and documents is true and accurate to the best of my knowledge.',
    '• I authorize the Company to verify my credentials and background information as required.',
    '• I have received and reviewed the Employee Handbook and related policy documents provided during onboarding.'
  ];

  declaration.forEach(line => {
    checkPageBreak();
    const splitLine = doc.splitTextToSize(line, pageWidth - 2 * margin);
    splitLine.forEach(text => {
      addText(text, margin, yPos, { fontSize: 10 });
      yPos += 6;
    });
  });

  yPos += 15;
  checkPageBreak(40);

  // Signature Section
  doc.line(margin, yPos, margin + 70, yPos);
  addText('Employee Signature', margin, yPos + 5, { fontSize: 9 });
  
  const today = new Date().toLocaleDateString('en-IN');
  doc.line(pageWidth - margin - 70, yPos, pageWidth - margin, yPos);
  addText('Date: ' + today, pageWidth - margin - 65, yPos + 5, { fontSize: 9 });

  yPos += 15;
  checkPageBreak(20);
  addText(`Employee Name: ${candidateData.profileData?.fullName || candidateData.name}`, margin, yPos, { fontSize: 9 });
  yPos += 6;
  addText(`Employee Code: ${candidateData.profileData?.employeeCode || 'N/A'}`, margin, yPos, { fontSize: 9 });

  // For Office Use Only Section
  yPos += 20;
  checkPageBreak(30);
  doc.setFillColor(245, 245, 245);
  doc.rect(margin - 5, yPos - 5, pageWidth - 2 * margin + 10, 25, 'F');
  addText('For Office Use Only', margin, yPos, { fontSize: 10, fontStyle: 'bold' });
  yPos += 8;
  addText('HR Signature: _______________________', margin, yPos, { fontSize: 9 });
  yPos += 8;
  addText('Date: _______________________', margin, yPos, { fontSize: 9 });

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      'ESME Consumer (P) Ltd - Confidential Document',
      pageWidth / 2,
      doc.internal.pageSize.height - 5,
      { align: 'center' }
    );
  }

  return doc;
};
