import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { PDFDocument } from 'pdf-lib';
import adobePdfService from './adobePdfService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function mapForm11Data(candidateData) {
  const data = candidateData.form11Data || candidateData;

  const dobParts = (data.dob || data.dateOfBirth || candidateData.dob || candidateData.dateOfBirth || '').split('-');
  const nameParts = (data.name || data.fullName || candidateData.name || candidateData.fullName || '').split(' ');
  const fatherParts = (data.fatherName || candidateData.fatherName || '').split(' ');

  const gender = data.gender || candidateData.gender || '';
  const maritalStatus = (data.maritalStatus || candidateData.maritalStatus || '').toLowerCase();
  const education = (data.highestQualification || data.education || candidateData.highestQualification || candidateData.education || '').toLowerCase();

  const hasPreviousEmployment = data.hasPreviousEmployment || candidateData.hasPreviousEmployment || false;
  const internationalWorker = data.internationalWorker || candidateData.internationalWorker || false;
  const speciallyAbled = data.speciallyAbled || candidateData.speciallyAbled || 'no';

  const previousExitDate = (data.previousEmploymentExitDate || candidateData.previousEmploymentExitDate || '').split('-');
  const passportFromDate = (data.passportValidityFrom || candidateData.passportValidityFrom || '').split('-');
  const passportToDate = (data.passportValidityTo || data.passportValidity || candidateData.passportValidityTo || '').split('-');

  return {
    'memberName': data.name || data.fullName || candidateData.name || candidateData.fullName || '',
    'memberFirstName': nameParts[0] || '',
    'memberMiddleName': nameParts.length === 3 ? nameParts[1] : '',
    'memberLastName': nameParts.length === 2 ? nameParts[1] : (nameParts.length === 3 ? nameParts[2] : ''),

    'Mr': gender === 'M' || gender === 'Male',
    'Mrs': (gender === 'F' || gender === 'Female') && maritalStatus === 'married',
    'Ms': (gender === 'F' || gender === 'Female') && maritalStatus !== 'married',

    'FatherFirstName': fatherParts[0] || '',
    'FatherMiddleName': fatherParts.length === 3 ? fatherParts[1] : '',
    'FatherLastName': fatherParts.length === 2 ? fatherParts[1] : (fatherParts.length === 3 ? fatherParts[2] : ''),
    'Father': true,
    'Husband': false,

    'Day': dobParts[2] || dobParts[0] || '',
    'Month': dobParts[1] || '',
    'Year': dobParts[0] || dobParts[2] || '',

    'Male': gender === 'M' || gender === 'Male',
    'Female': gender === 'F' || gender === 'Female',
    'Transgender': gender === 'T' || gender === 'Transgender',

    'married': maritalStatus === 'married',
    'unmarried': maritalStatus === 'unmarried' || maritalStatus === 'single',
    'widow/widower': maritalStatus === 'widow' || maritalStatus === 'widower' || maritalStatus === 'widowed',
    'divorcee': maritalStatus === 'divorced' || maritalStatus === 'divorcee',

    'mobile': data.mobileNumber || candidateData.mobileNumber || candidateData.mobile || '',
    'email': data.email || data.emailId || candidateData.email || candidateData.emailId || '',

    'aadharNumber': data.aadhaarNumber || candidateData.aadhaarNumber || candidateData.aadhaar || '',
    'panNumber': data.panNumber || candidateData.panNumber || candidateData.pan || '',
    'uanNumber': (data.uanNumber || candidateData.uanNumber || candidateData.uan || '').toString().split('').join('       '),

    'accountNumber': data.accountNumber || data.bankAccountNumber || candidateData.accountNumber || candidateData.bankAccountNumber || '',
    'ifscCode': data.ifscCode || candidateData.ifscCode || '',

    '10th': education.includes('10th') || education.includes('matric') || education.includes('secondary'),
    '12th': education.includes('12th') || education.includes('senior') || education.includes('higher secondary'),
    'graduate': (education.includes('graduate') || education.includes('bachelor')) && !education.includes('post'),
    'postgraduate': education.includes('post') || education.includes('master') || education.includes('mba') || education.includes('mca'),
    'phd': education.includes('phd') || education.includes('doctorate'),
    'diploma': education.includes('diploma') || education.includes('iti'),
    'nonMatric': education.includes('non-matric') || education.includes('illiterate') || education.includes('below'),

    'PFSyes': hasPreviousEmployment && (data.previousPFMember || candidateData.previousPFMember),
    'PFSno': !hasPreviousEmployment || !(data.previousPFMember || candidateData.previousPFMember),
    'EPSyes': hasPreviousEmployment && (data.previousPensionMember || candidateData.previousPensionMember),
    'EPSno': !hasPreviousEmployment || !(data.previousPensionMember || candidateData.previousPensionMember),

    'previousDOEDay': hasPreviousEmployment ? (previousExitDate[2] || previousExitDate[0] || '') : '',
    'previousDOEMonth': hasPreviousEmployment ? (previousExitDate[1] || '') : '',
    'previousDOEYear': hasPreviousEmployment ? (previousExitDate[0] || previousExitDate[2] || '') : '',

    'schemeCertifiedNumber': hasPreviousEmployment ? (data.schemeClaimSettled || candidateData.schemeClaimSettled || '') : '',
    'ppoNumber': hasPreviousEmployment ? (data.pfClaimSettled || candidateData.pfClaimSettled || '') : '',

    'intYes': internationalWorker,
    'intNo': !internationalWorker,
    'nameOfCountry': internationalWorker ? (data.countryOfOrigin || candidateData.countryOfOrigin || '') : '',
    'india': !internationalWorker || (data.countryOfOrigin || candidateData.countryOfOrigin || 'India') === 'India',
    'passportNumnber': internationalWorker ? (data.passportNumber || candidateData.passportNumber || '') : '',

    'passportDayFrom': internationalWorker ? (passportFromDate[2] || passportFromDate[0] || '') : '',
    'passportMonthFrom': internationalWorker ? (passportFromDate[1] || '') : '',
    'passportYearForm': internationalWorker ? (passportFromDate[0] || passportFromDate[2] || '') : '',

    'passportDayTo': internationalWorker ? (passportToDate[2] || passportToDate[0] || '') : '',
    'passportMonthTo': internationalWorker ? (passportToDate[1] || '') : '',
    'passportYearTo': internationalWorker ? (passportToDate[0] || passportToDate[2] || '') : '',

    'speciallyabledYes': speciallyAbled === 'yes',
    'speciallyabledNo': speciallyAbled !== 'yes',
    'locomotive': speciallyAbled === 'yes' && (data.disabilityType || candidateData.disabilityType || '').toLowerCase().includes('locomot'),
    'visual': speciallyAbled === 'yes' && (data.disabilityType || candidateData.disabilityType || '').toLowerCase().includes('visual'),
    'hearing': speciallyAbled === 'yes' && (data.disabilityType || candidateData.disabilityType || '').toLowerCase().includes('hearing'),

    'formDate': data.date || data.declarationDate || candidateData.date || candidateData.declarationDate || new Date().toLocaleDateString('en-IN'),
    'formPlace': data.place || data.declarationPlace || candidateData.place || candidateData.declarationPlace || candidateData.currentCity || '',
  };
}

function mapFormFData(candidateData) {
  const data = candidateData.formFData || candidateData;

  const dobParts = (data.dob || data.dateOfBirth || candidateData.dob || candidateData.dateOfBirth || '').split('-');
  const joiningParts = (data.dateOfJoining || candidateData.dateOfJoining || '').split('-');

  return {
    'Give here name or description of the establishment with full address': data.currentEmployerName || candidateData.currentEmployerName || 'ESME Consumer Pvt Ltd',
    'Village': data.permanentCity || candidateData.permanentCity || '',
    'Thana': data.permanentCity || candidateData.permanentCity || '',
    'subdivision': data.permanentCity || candidateData.permanentCity || '',
    'Post office': data.permanentCity || candidateData.permanentCity || '',
    'District': data.permanentCity || candidateData.permanentCity || '',
    'State': data.permanentState || candidateData.permanentState || '',
    'Or rubber stamp thereof': '',

    'employeeName': data.name || data.fullName || candidateData.name || candidateData.fullName || '',
    'gender': data.gender || candidateData.gender || '',
    'religion': data.religion || candidateData.religion || '',
    'maritalStatus': data.maritalStatus || candidateData.maritalStatus || '',
    'department': data.department || candidateData.department || '',
    'dateOfJoining': joiningParts.length === 3 ? `${joiningParts[2]}/${joiningParts[1]}/${joiningParts[0]}` : (data.dateOfJoining || candidateData.dateOfJoining || ''),

    'nomineeName1': data.nominees?.[0]?.name || candidateData.nominees?.[0]?.name || data.nomineeName || candidateData.nomineeName || '',
    'nomineeAddress1': data.nominees?.[0]?.address || candidateData.nominees?.[0]?.address || data.nomineeAddress || candidateData.nomineeAddress || '',
    'nomineeRelation1': data.nominees?.[0]?.relationship || data.nominees?.[0]?.relation || candidateData.nominees?.[0]?.relationship || data.nomineeRelationship || candidateData.nomineeRelationship || '',
    'nomineeAge1': data.nominees?.[0]?.age || candidateData.nominees?.[0]?.age || '',
    'nomineeShare1': data.nominees?.[0]?.share || candidateData.nominees?.[0]?.share || '100',

    'nomineeName2': data.nominees?.[1]?.name || candidateData.nominees?.[1]?.name || '',
    'nomineeAddress2': data.nominees?.[1]?.address || candidateData.nominees?.[1]?.address || '',
    'nomineeRelation2': data.nominees?.[1]?.relationship || data.nominees?.[1]?.relation || candidateData.nominees?.[1]?.relationship || '',
    'nomineeAge2': data.nominees?.[1]?.age || candidateData.nominees?.[1]?.age || '',
    'nomineeShare2': data.nominees?.[1]?.share || candidateData.nominees?.[1]?.share || '',

    'formDate': data.date || data.declarationDate || candidateData.date || new Date().toLocaleDateString('en-IN'),
    'formPlace': data.place || data.declarationPlace || candidateData.place || candidateData.currentCity || '',
    // Add variations for Witness/Employer section Place/Date
    'place': data.place || data.declarationPlace || candidateData.place || candidateData.currentCity || '',
    'date': data.date || data.declarationDate || candidateData.date || new Date().toLocaleDateString('en-IN'),
    'witnessPlace': data.place || data.declarationPlace || candidateData.place || candidateData.currentCity || '',
    'witnessDate': data.date || data.declarationDate || candidateData.date || new Date().toLocaleDateString('en-IN'),

    // Witness details are intentionally left blank for manual filling as they are not captured in the digital form
    'nameWitness1': '',
    'nameWitness2': '',
    'witnessSign1': '',
    'witnessSign2': '',
  };
}

function mapForm2Data(candidateData) {
  const data = candidateData.pfNominationData || candidateData.formData || candidateData;

  console.log('🔍 Form 2 Debug - Available data:', {
    name: candidateData.fullName || candidateData.name,
    hasEpfNominees: !!candidateData.epfNominees,
    epfNomineesCount: candidateData.epfNominees?.length || 0,
    hasEpsFamilyNominees: !!candidateData.epsFamilyNominees,
    epsFamilyNomineesCount: candidateData.epsFamilyNominees?.length || 0
  });

  const dobParts = (data.dateOfBirth || data.dob || candidateData.dateOfBirth || candidateData.dob || '').split('-');
  const dobFormatted = dobParts.length === 3 ? `${dobParts[2]}/${dobParts[1]}/${dobParts[0]}` : (data.dateOfBirth || data.dob || '');

  // Get EPF nominees (Part A)
  const epfNominees = candidateData.epfNominees || data.epfNominees || [];
  const nominee1 = epfNominees[0] || {};
  const nominee2 = epfNominees[1] || {};

  console.log('🔍 Nominee 1 data:', nominee1);

  const nominee1DOB = (nominee1.dateOfBirth || nominee1.dob || '').split('-');
  const nominee1DOBFormatted = nominee1DOB.length === 3 ? `${nominee1DOB[2]}/${nominee1DOB[1]}/${nominee1DOB[0]}` : (nominee1.dateOfBirth || nominee1.dob || '');

  const nominee2DOB = (nominee2.dateOfBirth || nominee2.dob || '').split('-');
  const nominee2DOBFormatted = nominee2DOB.length === 3 ? `${nominee2DOB[2]}/${nominee2DOB[1]}/${nominee2DOB[0]}` : (nominee2.dateOfBirth || nominee2.dob || '');

  // Get EPS family members (Part B)
  // Get EPS family members (Part B)
  console.log('🔍 Debug - Raw candidateData keys:', Object.keys(candidateData));
  console.log('🔍 Debug - Raw data keys:', Object.keys(data));
  console.log('🔍 Debug - candidateData.epsNominee:', candidateData.epsNominee);

  let epsFamily = candidateData.epsFamilyNominees || data.epsFamilyNominees || data.familyMembers || candidateData.familyMembers || candidateData.epsNominee || data.epsNominee || [];

  console.log('🔍 Debug - epsFamily before array check:', epsFamily);

  // Ensure it's an array
  if (epsFamily && !Array.isArray(epsFamily)) {
    // If it's an empty object, treat as empty array
    if (Object.keys(epsFamily).length === 0) {
      epsFamily = [];
    } else {
      epsFamily = [epsFamily];
    }
  }

  console.log('🔍 Debug - epsFamily final:', epsFamily);

  if (epsFamily.length > 0) {
    console.log('🔍 EPS Family Member 1:', epsFamily[0]);
  } else {
    console.log('🔍 No EPS Family members found. Checked keys: epsFamilyNominees, epsNominee, familyMembers. Available: ', Object.keys(data).filter(k => k.toLowerCase().includes('eps')));
  }

  return {
    'employeeName': data.employeeName || candidateData.fullName || candidateData.name || '',
    'employeeFatherName': data.fatherOrSpouseName || candidateData.fatherName || '',
    'employeeDOB': dobFormatted,
    'gender': data.gender || candidateData.gender || '',
    'maritalStatus': data.maritalStatus || candidateData.maritalStatus || '',
    'permanentAddress': data.permanentAddress || candidateData.permanentAddress || candidateData.address || '',

    // Part A - EPF Nominees
    'nomineeName1': nominee1.name || '',
    'nomineeAddress1': nominee1.address || '',
    'nomineeRelationship1': nominee1.relationship || '',
    'nomineeDOB1': nominee1DOBFormatted,
    'nomineeShare1': nominee1.sharePercent || nominee1.share || '',
    'minorguardiandetails1': nominee1.guardianName || '',

    'nomineeName2': nominee2.name || '',
    'nomineeAddress2': nominee2.address || '',
    'nomineeRelationship2': nominee2.relationship || '',
    'nomineeDOB2': nominee2DOBFormatted,
    'nomineeShare2': nominee2.sharePercent || nominee2.share || '',

    // Part B - EPS Family Members
    'epsfamilymembername1': epsFamily[0]?.name || '',
    'epsfamilymemberAddress1': epsFamily[0]?.address || '',
    'epsfamilymemberDOB1': epsFamily[0]?.dateOfBirth || epsFamily[0]?.dob || '',
    'epsfamilymemberrelation1': epsFamily[0]?.relationship || '',

    'epsfamilymembername2': epsFamily[1]?.name || '',
    'epsfamilymemberAddress2': epsFamily[1]?.address || '',
    'epsfamilymemberDOB2': epsFamily[1]?.dateOfBirth || epsFamily[1]?.dob || '',
    'epsfamilymemberrelation2': epsFamily[1]?.relationship || '',

    'epsfamilymembername3': epsFamily[2]?.name || '',
    'epsfamilymemberAddress3': epsFamily[2]?.address || '',
    'epsfamilymemberDOB3': epsFamily[2]?.dateOfBirth || epsFamily[2]?.dob || '',
    'epsfamilymemberrelation3': epsFamily[2]?.relationship || '',

    'epsfamilymembername4': epsFamily[3]?.name || '',
    'epsfamilymemberAddress4': epsFamily[3]?.address || '',
    'epsfamilymemberDOB4': epsFamily[3]?.dateOfBirth || epsFamily[3]?.dob || '',
    'epsfamilymemberrelation4': epsFamily[3]?.relationship || '',

    'epsfamilymembername5': epsFamily[4]?.name || '',
    'epsfamilymemberAddress5': epsFamily[4]?.address || '',
    'epsfamilymemberDOB5': epsFamily[4]?.dateOfBirth || epsFamily[4]?.dob || '',
    'epsfamilymemberrelation5': epsFamily[4]?.relationship || '',

    'nomineewidowpension': '',
    'nomineewidowDOB': '',
    'nomineewidowrelation': '',

    'formDate': data.declarationDate || candidateData.date || new Date().toLocaleDateString('en-IN'),
    'formPlace': data.declarationPlace || candidateData.place || candidateData.currentCity || '',
  };
}

export async function fillForm11Adobe(candidateData, signatureBuffer) {
  try {
    console.log('📄 Filling Form 11');

    const templatePath = path.join(__dirname, '../../public/forms/Form 11_1.pdf');
    const formData = mapForm11Data(candidateData);

    const filledPdf = await adobePdfService.fillForm(templatePath, formData, signatureBuffer, 'ALL_PAGES');
    return filledPdf;
  } catch (error) {
    console.error('❌ Form 11 error:', error);
    throw error;
  }
}

export async function fillFormFAdobe(candidateData, signatureBuffer) {
  try {
    console.log('📄 Filling Form F');

    const templatePath = path.join(__dirname, '../../public/forms/FORM_F_1.pdf');
    const formData = mapFormFData(candidateData);

    // Sign ALL pages per user request
    const filledPdf = await adobePdfService.fillForm(templatePath, formData, signatureBuffer, 'ALL_PAGES');
    return filledPdf;
  } catch (error) {
    console.error('❌ Form F error:', error);
    throw error;
  }
}

export async function fillForm2Adobe(candidateData, signatureBuffer) {
  try {
    console.log('📄 Filling PF Nomination Form');

    const templatePath = path.join(__dirname, '../../public/forms/PF_Nomination_Form_1.pdf');
    const formData = mapForm2Data(candidateData);

    // Sign ALL pages per user request
    const filledPdfBytes = await adobePdfService.fillForm(templatePath, formData, signatureBuffer, 'ALL_PAGES');

    return filledPdfBytes;
  } catch (error) {
    console.error('❌ PF Nomination Form error:', error);
    throw error;
  }
}
