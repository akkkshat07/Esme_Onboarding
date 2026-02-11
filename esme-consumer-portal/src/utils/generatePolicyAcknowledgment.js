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

  doc.setFillColor(0, 51, 102);
  doc.rect(0, 0, pageWidth, 30, 'F');
  addText('ESME CONSUMER (P) LTD', pageWidth / 2, 15, {
    fontSize: 16,
    fontStyle: 'bold',
    font: 'helvetica',
    align: 'center'
  });
  doc.setTextColor(255, 255, 255);
  addText('POLICY ACKNOWLEDGMENT & DECLARATION', pageWidth / 2, 22, {
    fontSize: 12,
    align: 'center'
  });
  doc.setTextColor(0, 0, 0);

  yPos = 45;

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

  addText('POLICY ACKNOWLEDGMENT', margin, yPos, { fontSize: 12, fontStyle: 'bold' });
  yPos += 10;

  const policies = [
    {
      title: 'Code of Conduct & Professional Ethics',
      content: 'I have received, read, and understood the Company\'s Code of Conduct and Professional Ethics Policy. I agree to maintain the highest standards of professional behavior, integrity, and ethical conduct in all my interactions with colleagues, clients, and stakeholders. I will treat all individuals with respect and dignity, and refrain from any behavior that could be considered discriminatory, harassing, or unprofessional.'
    },
    {
      title: 'Confidentiality & Non-Disclosure',
      content: 'I acknowledge my responsibility to maintain strict confidentiality of all proprietary information, trade secrets, client data, business strategies, and any other confidential information I may have access to during my employment. I understand that unauthorized disclosure of confidential information is a serious breach of trust and may result in legal action. I agree not to disclose any confidential information during or after my employment with ESME Consumer (P) Ltd.'
    },
    {
      title: 'Information Security & Data Protection',
      content: 'I have been briefed on the Company\'s Information Security and Data Protection Policy. I agree to protect company data and systems, use technology resources responsibly and only for authorized purposes, maintain password security and not share credentials with others, report any security incidents or data breaches immediately, and comply with all applicable data privacy laws and regulations including GDPR requirements.'
    },
    {
      title: 'Attendance, Leave & Working Hours',
      content: 'I understand and agree to comply with the Company\'s policies regarding attendance, punctuality, working hours, and leave management. I will maintain regular attendance, arrive on time for work, follow proper procedures for requesting leave and time off, accurately record my working hours using the company\'s timekeeping systems, and inform my supervisor promptly in case of absence or delay.'
    },
    {
      title: 'Workplace Safety & Health',
      content: 'I commit to following all workplace health and safety guidelines and regulations. I will report any workplace hazards, unsafe conditions, or accidents immediately to my supervisor, use protective equipment when required and follow safety protocols, maintain a clean and safe working environment, participate in safety training programs as required, and not engage in any behavior that could endanger myself or others in the workplace.'
    }
  ];

  policies.forEach((policy, index) => {
    checkPageBreak(20);
    doc.setFillColor(240, 240, 240);
    doc.rect(margin - 2, yPos - 5, pageWidth - 2 * margin + 4, 8, 'F');
    addText(`${index + 1}. ${policy.title}`, margin, yPos, { fontStyle: 'bold' });
    yPos += 8;
    
    checkPageBreak(15);
    const splitContent = doc.splitTextToSize(policy.content, pageWidth - 2 * margin - 10);
    splitContent.forEach(line => {
      checkPageBreak();
      addText(line, margin + 5, yPos, { fontSize: 9 });
      yPos += 5;
    });
    yPos += 3;
  });

  yPos += 10;
  checkPageBreak(30);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  addText('DECLARATION', margin, yPos, { fontSize: 12, fontStyle: 'bold' });
  yPos += 10;

  const declaration = [
    'I hereby declare that:',
    '',
    '• I have read and understood all the above-mentioned policies and guidelines.',
    '• I agree to comply with all Company policies, procedures, and standards.',
    '• I understand that violation of any policy may result in disciplinary action, including termination.',
    '• All information provided by me in my employment application and documents is true and accurate.',
    '• I authorize the Company to verify my credentials and background information.',
    '• I have received and reviewed the Employee Handbook and related policy documents.'
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

  yPos += 20;
  checkPageBreak(30);
  doc.setFillColor(245, 245, 245);
  doc.rect(margin - 5, yPos - 5, pageWidth - 2 * margin + 10, 25, 'F');
  addText('For Office Use Only', margin, yPos, { fontSize: 10, fontStyle: 'bold' });
  yPos += 8;
  addText('HR Signature: _______________________', margin, yPos, { fontSize: 9 });
  yPos += 8;
  addText('Date: _______________________', margin, yPos, { fontSize: 9 });

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
