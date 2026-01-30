export const generateChecklistPDF = async (candidate) => {
  const jsPDF = (await import('jspdf')).default;
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 15;
  const margin = 15;
  const colWidth = (pageWidth - 2 * margin) / 2;


  doc.setFillColor(30, 70, 120);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text('JOINING DOCUMENT CHECKLIST', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Esme Consumer (P) Ltd.', pageWidth / 2, 23, { align: 'center' });
  
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, pageWidth / 2, 30, { align: 'center' });

  yPosition = 45;


  doc.setFillColor(245, 247, 250);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 30, 'F');
  doc.setDrawColor(200, 210, 220);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 30, 'S');

  yPosition += 8;
  doc.setFontSize(9);
  doc.setTextColor(60, 80, 100);
  doc.setFont(undefined, 'bold');
  doc.text('Candidate Name:', margin + 5, yPosition);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(20, 30, 50);
  doc.text(candidate.name || '________________________', margin + 40, yPosition);

  doc.setTextColor(60, 80, 100);
  doc.setFont(undefined, 'bold');
  doc.text('Designation:', colWidth + margin + 5, yPosition);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(20, 30, 50);
  doc.text(candidate.designation || candidate.profileData?.profession || '________________________', colWidth + margin + 35, yPosition);

  yPosition += 8;
  doc.setTextColor(60, 80, 100);
  doc.setFont(undefined, 'bold');
  doc.text('Date of Joining:', margin + 5, yPosition);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(20, 30, 50);
  doc.text(candidate.profileData?.dateOfJoining || '________________________', margin + 40, yPosition);

  doc.setTextColor(60, 80, 100);
  doc.setFont(undefined, 'bold');
  doc.text('Location:', colWidth + margin + 5, yPosition);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(20, 30, 50);
  doc.text(candidate.profileData?.currentCity || '________________________', colWidth + margin + 35, yPosition);

  yPosition += 8;
  doc.setTextColor(60, 80, 100);
  doc.setFont(undefined, 'bold');
  doc.text('Employee ID:', margin + 5, yPosition);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(20, 30, 50);
  doc.text(candidate.employeeId || '________________________', margin + 40, yPosition);

  doc.setTextColor(60, 80, 100);
  doc.setFont(undefined, 'bold');
  doc.text('Department:', colWidth + margin + 5, yPosition);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(20, 30, 50);
  doc.text(candidate.profileData?.department || '________________________', colWidth + margin + 35, yPosition);

  yPosition += 18;


  const documents = [
    { name: 'Employee Joining Form', required: true, formKey: 'joiningFormData' },
    { name: 'PF Form 11', required: true, formKey: 'form11Data' },
    { name: 'Gratuity Form F', required: true, formKey: 'formFData' },
    { name: 'Medical Insurance Form', required: true, formKey: 'insuranceData', altFormKey: 'medicalInsuranceData' },
    { name: 'PF Nomination Form', required: true, formKey: 'pfNominationData' },
    { name: 'Self Declaration Form', required: true, formKey: 'selfDeclarationData' },
    { name: '10th Standard Certificate', required: true, docType: '10th' },
    { name: '12th Standard Certificate', required: true, docType: '12th' },
    { name: 'Undergraduate Degree', required: true, docType: 'degree' },
    { name: 'Postgraduate Degree', required: false, docType: 'postgrad' },
    { name: 'Experience Letters', required: false, docType: 'experience' },
    { name: 'Aadhaar Card Copy', required: true, docType: 'aadhaar' },
    { name: 'PAN Card Copy', required: true, docType: 'pan' },
    { name: 'Passport Size Photos (2)', required: true, docType: 'photo' },
    { name: 'Bank Passbook / Cancelled Cheque', required: true, docType: 'bank' },
    { name: 'Previous Employment Relieving Letter', required: false, docType: 'relieving' }
  ];


  const uploadedDocs = candidate.documents?.map(d => d.type?.toLowerCase()) || [];
  const profileData = candidate.profileData || {};
  
  // Check if form data exists (form was filled/generated)
  const isFormGenerated = (formKey, altFormKey) => {
    if (!formKey) return false;
    const formData = profileData[formKey];
    const altFormData = altFormKey ? profileData[altFormKey] : null;
    return (formData && Object.keys(formData).length > 0) || (altFormData && Object.keys(altFormData).length > 0);
  };
  
  // Check if document was uploaded
  const isDocUploaded = (docType) => {
    if (!docType) return false;
    return uploadedDocs.some(d => 
      d && (d.includes(docType) || docType.includes(d.substring(0, 5)))
    );
  };
  

  doc.setFillColor(30, 70, 120);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 7, 'F');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text('DOCUMENTS CHECKLIST', margin + 5, yPosition + 5);
  yPosition += 12;


  doc.setFillColor(240, 242, 245);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 7, 'F');
  doc.setFontSize(8);
  doc.setTextColor(60, 80, 100);
  doc.setFont(undefined, 'bold');
  doc.text('S.No', margin + 3, yPosition + 5);
  doc.text('Document Name', margin + 15, yPosition + 5);
  doc.text('Required', margin + 100, yPosition + 5);
  doc.text('Submitted', margin + 125, yPosition + 5);
  doc.text('Verified', margin + 152, yPosition + 5);
  yPosition += 10;


  doc.setFont(undefined, 'normal');
  doc.setTextColor(30, 40, 50);
  
  documents.forEach((docItem, index) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }


    if (index % 2 === 0) {
      doc.setFillColor(250, 251, 252);
      doc.rect(margin, yPosition - 3, pageWidth - 2 * margin, 7, 'F');
    }

    doc.setFontSize(8);
    doc.text(`${index + 1}`, margin + 5, yPosition);
    doc.text(docItem.name, margin + 15, yPosition);
    doc.text(docItem.required ? 'Yes' : 'No', margin + 105, yPosition);
    
    // Check if form is generated or document is uploaded
    const isCompleted = docItem.formKey 
      ? isFormGenerated(docItem.formKey, docItem.altFormKey) 
      : isDocUploaded(docItem.docType);
    
    // Submitted checkbox
    doc.rect(margin + 130, yPosition - 3, 4, 4);
    if (isCompleted) {
      doc.setFontSize(10);
      doc.text('✓', margin + 130.5, yPosition);
      doc.setFontSize(8);
    }
    
    // Verified checkbox (empty for HR to fill)
    doc.rect(margin + 157, yPosition - 3, 4, 4);

    yPosition += 8;
  });

  yPosition += 10;


  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFillColor(30, 70, 120);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 7, 'F');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text('VERIFICATION', margin + 5, yPosition + 5);
  yPosition += 15;

  doc.setFontSize(8);
  doc.setTextColor(30, 40, 50);
  doc.setFont(undefined, 'normal');


  doc.setFont(undefined, 'bold');
  doc.text('Candidate Name:', margin, yPosition);
  doc.setFont(undefined, 'normal');
  doc.text(candidate.name || '________________________', margin + 35, yPosition);
  
  doc.setFont(undefined, 'bold');
  doc.text('Submitted Date:', margin + 95, yPosition);
  doc.setFont(undefined, 'normal');
  const submittedDate = candidate.submittedAt 
    ? new Date(candidate.submittedAt).toLocaleDateString('en-IN') 
    : '________________________';
  doc.text(submittedDate, margin + 130, yPosition);
  yPosition += 12;


  doc.setFont(undefined, 'bold');
  doc.text('Verified By HR:', margin, yPosition);
  doc.setFont(undefined, 'normal');
  doc.text(candidate.hrVerified ? 'Yes' : 'No', margin + 35, yPosition);
  
  doc.setFont(undefined, 'bold');
  doc.text('Approval Date:', margin + 95, yPosition);
  doc.setFont(undefined, 'normal');
  const approvedDate = candidate.approvedAt 
    ? new Date(candidate.approvedAt).toLocaleDateString('en-IN') 
    : '________________________';
  doc.text(approvedDate, margin + 130, yPosition);
  yPosition += 12;


  doc.setFont(undefined, 'bold');
  doc.text('Employee ID:', margin, yPosition);
  doc.setFont(undefined, 'normal');
  doc.text(candidate.employeeId || '________________________', margin + 35, yPosition);
  yPosition += 12;


  doc.setFont(undefined, 'bold');
  doc.text('HR Remarks:', margin, yPosition);
  doc.setFont(undefined, 'normal');
  const remarks = candidate.hrRemarks || '________________________';

  const maxRemarkWidth = pageWidth - margin - 35;
  const remarkLines = doc.splitTextToSize(remarks, maxRemarkWidth);
  doc.text(remarkLines, margin + 30, yPosition);
  yPosition += (remarkLines.length * 5) + 5;


  const footerY = pageHeight - 10;
  doc.setFontSize(7);
  doc.setTextColor(120, 130, 140);
  doc.text('This is a system-generated document. | Esme Consumer (P) Ltd.', pageWidth / 2, footerY, { align: 'center' });

  return doc;
};

export const viewChecklistPDF = async (candidate) => {
  const doc = await generateChecklistPDF(candidate);
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl, '_blank');
};

export const downloadChecklistPDF = async (candidate) => {
  const doc = await generateChecklistPDF(candidate);
  const fileName = `Document_Checklist_${candidate.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
