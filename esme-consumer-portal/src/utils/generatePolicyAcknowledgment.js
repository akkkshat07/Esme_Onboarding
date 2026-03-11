import { ESME_LOGO_BASE64 } from '../constants/esmeLogoBase64.js';

export const generatePolicyAcknowledgment = async (candidateData) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF('p', 'mm', 'a4');

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;

  // ESME Brand Colors
  const teal = [0, 128, 128];
  const dark = [30, 41, 59];
  const gray = [100, 116, 139];
  const lightBg = [240, 253, 250];

  let yPos = 0;

  // --- Header with ESME Logo Image ---
  const logoY = 12;
  try {
    // Add Logo Image (40mm width, 15mm height approx)
    doc.addImage(ESME_LOGO_BASE64, 'PNG', margin, logoY, 40, 15, undefined, 'FAST');
  } catch (e) {
    console.error('Error adding logo:', e);
  }

  // Title Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('POLICY ACKNOWLEDGMENT', pageWidth - margin, logoY + 10, { align: 'right' });

  // Line
  doc.setDrawColor(0, 128, 128);
  doc.setLineWidth(0.5);
  doc.line(margin, logoY + 18, pageWidth - margin, logoY + 18);

  yPos = 35;

  // --- Helper Functions ---
  const addSectionHeader = (title) => {
    doc.setFillColor(...lightBg);
    doc.setDrawColor(...teal);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 7, 1, 1, 'FD');
    doc.setTextColor(...teal);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin + 3, yPos + 4.5);
    yPos += 10;
  };

  const addLabelValue = (label, value, x, y) => {
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.setFont('helvetica', 'normal');
    doc.text(label, x, y);
    doc.setTextColor(...dark);
    doc.setFont('helvetica', 'bold');
    doc.text(value || '-', x + 25, y);
  };

  // --- Employee Information ---
  addSectionHeader('Employee Information');

  const col1X = margin + 2;
  const col2X = pageWidth / 2 + 5;

  const pd = candidateData.profileData || {};
  const jf = pd.joiningFormData || {};
  const mi = pd.medicalInsuranceData || {};

  const fullName = jf.firstName ? `${jf.firstName} ${jf.lastName || ''}`.trim() : (candidateData.name || '');
  const designation = jf.designation || pd.designation || 'Not Assigned';
  const employeeCode = mi.employeeCode || pd.employeeCode || 'To be assigned';
  const joiningDate = jf.dateOfJoining || pd.dateOfJoining || new Date().toISOString().split('T')[0];
  const department = jf.department || pd.department || 'Not Assigned';

  addLabelValue('Name:', fullName, col1X, yPos);
  addLabelValue('Designation:', designation, col2X, yPos);
  yPos += 5;

  addLabelValue('Emp Code:', employeeCode, col1X, yPos);
  addLabelValue('Date of Joining:', joiningDate, col2X, yPos);
  yPos += 5;

  addLabelValue('Department:', department, col1X, yPos);
  yPos += 8;

  // --- Policy Acknowledgment ---
  addSectionHeader('Policy Acknowledgment');

  doc.setTextColor(...dark);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('I hereby acknowledge and confirm that:', margin + 2, yPos);
  yPos += 4;

  const acknowledgments = [
    'I have received, accessed, and carefully read the complete "ESME Company Policies" document.',
    'I have had sufficient opportunity to review all company policies, procedures, and guidelines contained therein.',
    'I understand all the policies, rules, regulations, and expectations outlined in the company policies document.',
    'I agree to comply with and abide by all policies, procedures, and guidelines set forth.',
    'I understand that violation of any company policy may result in disciplinary action, including termination.',
    'I acknowledge that the company reserves the right to modify policies at any time, and I will be notified of changes.',
    'I understand that my continued employment is contingent upon my compliance with all company policies.'
  ];

  doc.setFont('helvetica', 'normal');
  acknowledgments.forEach((ack, index) => {
    const splitAck = doc.splitTextToSize(`${index + 1}. ${ack}`, pageWidth - 2 * margin - 5);
    doc.text(splitAck, margin + 2, yPos);
    yPos += (splitAck.length * 3.5) + 1;
  });

  yPos += 5;

  // --- Signature Block ---
  addSectionHeader('Employee Signature');

  if (candidateData.signature) {
    try {
      // Handle signature image (base64)
      const sigImage = candidateData.signature;
      // If signature is a data URL, add it
      if (typeof sigImage === 'string' && sigImage.startsWith('data:image')) {
         doc.addImage(sigImage, 'PNG', margin + 5, yPos, 40, 20);
         yPos += 22;
      } else {
         doc.text('(Signature not available)', margin + 5, yPos + 10);
         yPos += 15;
      }
    } catch (e) {
      console.error('Error adding signature:', e);
      doc.text('(Signature error)', margin + 5, yPos + 10);
      yPos += 15;
    }
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...gray);
    doc.text('(Digitally Signed)', margin + 5, yPos + 10);
    yPos += 15;
  }
  
  doc.setTextColor(...dark);
  doc.setFont('helvetica', 'bold');
  doc.text(fullName || 'Employee', margin + 5, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin - 40, yPos);

  return doc;
};
