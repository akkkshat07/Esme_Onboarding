import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { jsPDF } from 'jspdf';

const PDF_BASE_PATH = '/forms';


const setTextField = (form, fieldName, value, options = {}) => {
  try {
    const field = form.getTextField(fieldName);
    if (field && value !== undefined && value !== null && value !== '') {
      let textValue = String(value).trim();
      

      if (options.uppercase) {
        textValue = textValue.toUpperCase();
      }
      

      if (options.maxLength && textValue.length > options.maxLength) {
        textValue = textValue.substring(0, options.maxLength);
      }
      
      field.setText(textValue);
      

      if (options.fontSize) {
        field.setFontSize(options.fontSize);
      }
    }
  } catch (e) {
    console.log('Text field not found: ' + fieldName);
  }
};


const setCheckbox = (form, fieldName, shouldCheck) => {
  try {
    const field = form.getCheckBox(fieldName);
    if (field && shouldCheck) {
      field.check();
    }
  } catch (e) {
    console.log('Checkbox not found: ' + fieldName);
  }
};



const processSignatureForPDF = (signatureDataUrl) => {
  return new Promise((resolve) => {
    if (!signatureDataUrl) {
      resolve(null);
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      

      ctx.drawImage(img, 0, 0);
      

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      

      let darkPixelCount = 0;
      let lightPixelCount = 0;
      
      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (brightness < 100) darkPixelCount++;
        if (brightness > 200) lightPixelCount++;
      }
      

      const isDarkMode = darkPixelCount > lightPixelCount * 0.5;
      
      if (isDarkMode) {

        for (let i = 0; i < data.length; i += 4) {
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          
          if (brightness < 80) {

            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
            data[i + 3] = 255;
          } else if (brightness > 180) {

            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 255;
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }

      
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => {
      resolve(signatureDataUrl);
    };
    
    img.src = signatureDataUrl;
  });
};



const embedSignature = async (pdfDoc, form, fieldName, signatureDataUrl) => {
  if (!signatureDataUrl) {
    console.log('No signature data provided for: ' + fieldName);
    return;
  }
  try {
    const field = form.getButton(fieldName);
    if (!field) {
      console.log('Signature button field not found: ' + fieldName);
      return;
    }
    

    console.log('Processing signature for field: ' + fieldName);
    let processedSignature = await processSignatureForPDF(signatureDataUrl);
    
    if (!processedSignature) {
      console.log('Failed to process signature for: ' + fieldName);
      return;
    }
    
    const base64Data = processedSignature.split(',')[1];
    if (!base64Data) {
      console.log('Invalid base64 data for signature: ' + fieldName);
      return;
    }
    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    let image;
    if (processedSignature.includes('image/png')) {
      image = await pdfDoc.embedPng(imageBytes);
    } else {
      image = await pdfDoc.embedJpg(imageBytes);
    }
    

    field.setImage(image);
    console.log('Successfully embedded signature for: ' + fieldName + ', image size:', image.width, 'x', image.height);
  } catch (e) {
    console.log('Error embedding signature for ' + fieldName + ': ' + e.message);
  }
};


const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  return String(date.getDate()).padStart(2, '0') + '/' + 
         String(date.getMonth() + 1).padStart(2, '0') + '/' + 
         date.getFullYear();
};


const getDateParts = (dateString) => {
  if (!dateString) return { day: '', month: '', year: '' };
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return { day: '', month: '', year: '' };
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    year: String(date.getFullYear())
  };
};


const splitName = (fullName) => {
  if (!fullName) return { first: '', middle: '', last: '' };
  const parts = String(fullName).trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], middle: '', last: '' };
  if (parts.length === 2) return { first: parts[0], middle: '', last: parts[1] };
  return { first: parts[0], middle: parts.slice(1, -1).join(' '), last: parts[parts.length - 1] };
};

















export const fillForm11 = async (candidateData, employeeSignature, adminSignature) => {
  try {
    console.log('Fetching Form 11 from:', PDF_BASE_PATH + '/Form 11.pdf');
    const response = await fetch(PDF_BASE_PATH + '/Form 11.pdf');
    console.log('Form 11 fetch response:', response.status, response.statusText);
    if (!response.ok) throw new Error('Failed to fetch Form 11: ' + response.status);
    
    const pdfBytes = await response.arrayBuffer();
    console.log('Form 11 PDF bytes loaded:', pdfBytes.byteLength);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    console.log('Form 11 PDF loaded successfully');
    

    const fields = form.getFields();
    console.log('Form 11 - All field names:');
    fields.forEach(field => {
      console.log('  Field:', field.getName(), '- Type:', field.constructor.name);
    });
    

    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    

    const addCharacterSpacing = (text, spacing = 1) => {
      if (!text) return '';

      return text.split('').join(' '.repeat(spacing));
    };
    

    const setFieldWithStyle = (fieldName, value, fontSize = 11, useBold = false, uppercase = false, addSpacing = false) => {
      try {
        const field = form.getTextField(fieldName);
        if (field && value !== undefined && value !== null && value !== '') {
          let textValue = String(value).trim();
          if (uppercase) {
            textValue = textValue.toUpperCase();
          }

          if (addSpacing) {
            textValue = addCharacterSpacing(textValue, 1);
          }
          field.setText(textValue);
          field.setFontSize(fontSize);
          field.defaultUpdateAppearances(useBold ? helveticaBold : helvetica);
        }
      } catch (e) {
        console.log('Field not found: ' + fieldName);
      }
    };
    

    const profile = candidateData.profileData || candidateData || {};
    const form11 = candidateData.form11Data || profile.form11Data || {};
    const joining = candidateData.joiningFormData || profile.joiningFormData || {};
    

    const fullName = profile.fullName || 
                     [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ') ||
                     form11.fullName || '';
    const nameParts = splitName(fullName);
    

    const firstName = (profile.firstName || nameParts.first || '').trim();
    const middleName = (profile.middleName || nameParts.middle || '').trim();
    const lastName = (profile.lastName || nameParts.last || '').trim();
    

    setFieldWithStyle('memberName', fullName, 9, false, true, true);
    setFieldWithStyle('memberFirstName', firstName, 10, false, true, true);
    setFieldWithStyle('memberMiddleName', middleName, 10, false, true, true);
    setFieldWithStyle('memberLastName', lastName, 10, false, true, true);
    

    const title = (profile.title || profile.salutation || form11.title || '').toLowerCase().replace('.', '');
    const gender = (profile.gender || form11.gender || joining.gender || '').toLowerCase();
    const marital = (profile.maritalStatus || form11.maritalStatus || joining.maritalStatus || '').toLowerCase();
    

    const isMale = gender === 'male' || gender === 'm';
    const isFemale = gender === 'female' || gender === 'f';
    const isMarried = marital === 'married';
    
    if (title === 'mr') {
      setCheckbox(form, 'Mr', true);
    } else if (title === 'mrs') {
      setCheckbox(form, 'Mrs', true);
    } else if (title === 'ms') {
      setCheckbox(form, 'Ms', true);
    } else if (isMale) {
      setCheckbox(form, 'Mr', true);
    } else if (isFemale) {
      if (isMarried) {
        setCheckbox(form, 'Mrs', true);
      } else {
        setCheckbox(form, 'Ms', true);
      }
    }
    

    const dob = profile.dateOfBirth || profile.dob || form11.dateOfBirth || joining.dateOfBirth || '';
    const dobParts = getDateParts(dob);
    setFieldWithStyle('Day', dobParts.day, 12, false, false, true);
    setFieldWithStyle('Month', dobParts.month, 12, false, false, true);
    setFieldWithStyle('Year', dobParts.year, 11, false, false, true);
    

    const fatherName = profile.fatherName || form11.fatherName || joining.fatherName || profile.fatherHusbandName || '';
    const fatherParts = splitName(fatherName);
    setFieldWithStyle('FatherFirstName', fatherParts.first, 10, false, true, true);
    setFieldWithStyle('FatherMiddleName', fatherParts.middle, 10, false, true, true);
    setFieldWithStyle('FatherLastName', fatherParts.last, 10, false, true, true);
    

    const relation = (form11.relationWithNominee || form11.fatherHusbandRelation || profile.fatherHusbandRelation || '').toLowerCase();
    const isHusband = relation === 'husband' || relation === 'spouse' || (isFemale && isMarried);
    setCheckbox(form, 'Father', !isHusband);
    setCheckbox(form, 'Husband', isHusband);
    

    if (isMale) {
      setCheckbox(form, 'Male', true);
    } else if (isFemale) {
      setCheckbox(form, 'Female', true);
    } else if (gender === 'transgender' || gender === 'other' || gender === 't') {
      setCheckbox(form, 'Transgender', true);
    }
    

    const mobile = String(profile.mobileNumber || profile.mobile || profile.phone || form11.mobileNumber || joining.mobileNumber || '').replace(/\D/g, '').slice(-10);
    setFieldWithStyle('mobile', mobile, 10, false, false, true);
    setFieldWithStyle('email', profile.email || profile.personalEmail || form11.email || joining.personalEmail || '', 9);
    

    const aadhaar = String(profile.aadhaarNumber || profile.aadharNumber || form11.aadhaarNumber || joining.aadhaarNumber || '').replace(/\D/g, '');
    const pan = String(profile.panNumber || form11.panNumber || joining.panNumber || '').toUpperCase().trim();
    setFieldWithStyle('aadharNumber', aadhaar, 10, false, false, true);
    setFieldWithStyle('panNumber', pan, 10, false, true, true);
    

    const accountNo = String(profile.bankAccountNumber || profile.accountNumber || form11.bankAccountNumber || joining.bankAccountNumber || '').trim();
    const ifsc = String(profile.ifscCode || profile.bankIfscCode || form11.ifscCode || joining.ifscCode || '').toUpperCase().trim();
    setFieldWithStyle('accountNumber', accountNo, 10, false, false, true);
    setFieldWithStyle('ifscCode', ifsc, 10, false, true, true);
    

    setFieldWithStyle('uanNumber', profile.uanNumber || form11.uanNumber || form11.previousUAN || '', 10, false, false, true);
    

    const prevDOE = form11.previousEmploymentExitDate || form11.previousDOE || '';
    if (prevDOE) {
      const prevDOEParts = getDateParts(prevDOE);
      setFieldWithStyle('previousDOEDay', prevDOEParts.day, 11, false, false, true);
      setFieldWithStyle('previousDOEMonth', prevDOEParts.month, 11, false, false, true);
      setFieldWithStyle('previousDOEYear', prevDOEParts.year, 10, false, false, true);
    }
    

    setFieldWithStyle('schemeCertifiedNumber', form11.schemeCertificateNumber || form11.previousPFNumber || '', 9, false, false, true);
    setFieldWithStyle('ppoNumber', form11.ppoNumber || '', 9);
    

    const education = (profile.education || profile.qualification || form11.education || joining.qualification || profile.highestQualification || '').toLowerCase();
    let educationChecked = false;
    
    if ((education.includes('phd') || education.includes('doctorate') || education.includes('doctor')) && !educationChecked) {
      setCheckbox(form, 'phd', true);
      educationChecked = true;
    }
    if ((education.includes('post') || education.includes('master') || education.includes('mba') || education.includes('mca') || education.includes('m.tech') || education.includes('m.sc')) && !educationChecked) {
      setCheckbox(form, 'postgraduate', true);
      educationChecked = true;
    }
    if ((education.includes('graduate') || education.includes('bachelor') || education.includes('b.tech') || education.includes('b.sc') || education.includes('b.com') || education.includes('b.a') || education.includes('bca') || education.includes('bba')) && !educationChecked) {
      setCheckbox(form, 'graduate', true);
      educationChecked = true;
    }
    if ((education.includes('diploma') || education.includes('iti')) && !educationChecked) {
      setCheckbox(form, 'diploma', true);
      educationChecked = true;
    }
    if ((education.includes('12') || education.includes('hsc') || education.includes('inter') || education.includes('higher secondary') || education.includes('plus two') || education.includes('+2')) && !educationChecked) {
      setCheckbox(form, '12th', true);
      educationChecked = true;
    }
    if ((education.includes('10') || education.includes('matric') || education.includes('ssc') || education.includes('secondary')) && !educationChecked) {
      setCheckbox(form, '10th', true);
      educationChecked = true;
    }
    if ((education.includes('below') || education.includes('non-matric') || education.includes('8th') || education.includes('primary') || education.includes('middle')) && !educationChecked) {
      setCheckbox(form, 'nonMatric', true);
      educationChecked = true;
    }

    if (!educationChecked && education.length > 0) {
      setCheckbox(form, 'graduate', true);
    }
    

    if (marital === 'married') {
      setCheckbox(form, 'married', true);
    } else if (marital === 'unmarried' || marital === 'single') {
      setCheckbox(form, 'unmarried', true);
    } else if (marital === 'widow' || marital === 'widower' || marital === 'widowed') {
      setCheckbox(form, 'widow/widower', true);
    } else if (marital === 'divorced' || marital === 'divorcee') {
      setCheckbox(form, 'divorcee', true);
    } else if (marital) {

      setCheckbox(form, 'unmarried', true);
    }
    

    const speciallyAbled = form11.speciallyAbled || form11.isSpeciallyAbled || profile.speciallyAbled || profile.isDisabled || '';
    const speciallyAbledStr = String(speciallyAbled).toLowerCase();
    const isSpeciallyAbled = speciallyAbledStr === 'yes' || speciallyAbledStr === 'true' || speciallyAbled === true;
    
    if (isSpeciallyAbled) {
      setCheckbox(form, 'speciallyabledYes', true);
      const disabilityType = (form11.disabilityType || profile.disabilityType || '').toLowerCase();
      if (disabilityType.includes('locomot') || disabilityType.includes('physical') || disabilityType.includes('ortho')) {
        setCheckbox(form, 'locomotive', true);
      }
      if (disabilityType.includes('visual') || disabilityType.includes('blind') || disabilityType.includes('vision')) {
        setCheckbox(form, 'visual', true);
      }
      if (disabilityType.includes('hearing') || disabilityType.includes('deaf')) {
        setCheckbox(form, 'hearing', true);
      }
    } else {
      setCheckbox(form, 'speciallyabledNo', true);
    }
    

    const intWorker = form11.internationalWorker || form11.isInternationalWorker || profile.internationalWorker || '';
    const intWorkerStr = String(intWorker).toLowerCase();
    const isInternational = intWorkerStr === 'yes' || intWorkerStr === 'true' || intWorker === true;
    
    if (isInternational) {
      setCheckbox(form, 'intYes', true);
    } else {
      setCheckbox(form, 'intNo', true);
      setCheckbox(form, 'india', true);
    }
    

    setFieldWithStyle('passportNumnber', profile.passportNumber || form11.passportNumber || joining.passportNumber || '', 11, false, true);
    setFieldWithStyle('nameOfCountry', form11.countryOfOrigin || profile.countryOfOrigin || 'INDIA', 11, false, true);
    

    const passportFrom = form11.passportValidityFrom || profile.passportValidityFrom || '';
    const passportTo = form11.passportValidityTo || form11.passportValidity || profile.passportValidityTo || '';
    if (passportFrom) {
      const fromParts = getDateParts(passportFrom);
      setFieldWithStyle('passportDayFrom', fromParts.day, 12);
      setFieldWithStyle('passportMonthFrom', fromParts.month, 12);
      setFieldWithStyle('passportYearForm', fromParts.year, 12);
    }
    if (passportTo) {
      const toParts = getDateParts(passportTo);
      setFieldWithStyle('passportDayTo', toParts.day, 12);
      setFieldWithStyle('passportMonthTo', toParts.month, 12);
      setFieldWithStyle('passportYearTo', toParts.year, 12);
    }
    

    const epsOption = form11.optForEPS || form11.epsOption || profile.epsOption || '';
    const epsStr = String(epsOption).toLowerCase();
    const optEPS = epsStr !== 'no' && epsStr !== 'false' && epsOption !== false;
    
    const pfsOption = form11.previousPFMember || form11.pfsOption || profile.previousPFMember || '';
    const pfsStr = String(pfsOption).toLowerCase();
    const optPFS = pfsStr === 'yes' || pfsStr === 'true' || pfsOption === true;
    

    if (optEPS) {
      setCheckbox(form, 'EPSyes', true);
    } else {
      setCheckbox(form, 'EPSno', true);
    }
    

    if (optPFS) {
      setCheckbox(form, 'PFSyes', true);
    } else {
      setCheckbox(form, 'PFSno', true);
    }
    

    setFieldWithStyle('formDate', formatDate(new Date()), 11);
    setFieldWithStyle('formPlace', form11.declarationPlace || profile.currentCity || profile.city || joining.currentCity || 'NEW DELHI', 11, false, true);
    

    await embedSignature(pdfDoc, form, 'signatureOfemployee_af_image', 
      employeeSignature || form11.employeeSignature || profile.signature || profile.form11Signature);
    


    
    return await pdfDoc.save();
  } catch (error) {
    console.error('Error filling Form 11:', error);
    throw error;
  }
};













export const fillFormF = async (candidateData, employeeSignature, adminSignature) => {
  try {
    console.log('Fetching Form F from:', PDF_BASE_PATH + '/FORM_F.PDF');
    const response = await fetch(PDF_BASE_PATH + '/FORM_F.PDF');
    console.log('Form F fetch response:', response.status, response.statusText);
    if (!response.ok) throw new Error('Failed to fetch Form F: ' + response.status);
    
    const pdfBytes = await response.arrayBuffer();
    console.log('Form F PDF bytes loaded:', pdfBytes.byteLength);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    console.log('Form F PDF loaded successfully');
    

    const fields = form.getFields();
    console.log('Form F - All field names:');
    fields.forEach(field => {
      console.log('  Field:', field.getName(), '- Type:', field.constructor.name);
    });
    

    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    

    const setStyledField = (fieldName, value, fontSize = 10) => {
      try {
        const field = form.getTextField(fieldName);
        if (field && value !== undefined && value !== null && value !== '') {
          field.setText(String(value).trim());
          field.setFontSize(fontSize);
          field.defaultUpdateAppearances(helveticaFont);
        }
      } catch (e) {
        console.log('Field not found: ' + fieldName);
      }
    };
    

    const profile = candidateData.profileData || candidateData || {};
    const formF = candidateData.formFData || profile.formFData || {};
    const joining = candidateData.joiningFormData || profile.joiningFormData || {};
    


    setStyledField('Give here name or description of the establishment with full address', '', 9);
    

    setStyledField('Village', formF.village || '', 10);
    setStyledField('Thana', formF.thana || formF.policeStation || '', 10);
    setStyledField('subdivision', formF.subdivision || '', 10);
    setStyledField('Post office', formF.postOffice || '', 10);
    setStyledField('District', formF.district || profile.currentDistrict || profile.district || '', 10);
    setStyledField('State', formF.state || profile.currentState || profile.state || joining.currentState || '', 10);
    setStyledField('Or rubber stamp thereof', '', 10);
    

    const fullName = profile.fullName || 
                     [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ') ||
                     formF.employeeName || '';

    setStyledField('employeeName', fullName, 8);
    

    const gender = formF.sex || profile.gender || formF.gender || joining.gender || '';
    setStyledField('gender', gender, 10);
    
    setStyledField('religion', formF.religion || profile.religion || '', 10);
    setStyledField('maritalStatus', formF.maritalStatus || profile.maritalStatus || joining.maritalStatus || '', 10);
    setStyledField('department', formF.department || profile.department || joining.department || '', 10);
    
    const doj = formF.dateOfJoining || profile.dateOfJoining || joining.dateOfJoining || '';
    setStyledField('dateOfJoining', formatDate(doj), 10);
    

    const nominee1 = formF.nominees?.[0] || formF.nominee1 || {};
    setStyledField('nomineeName1', nominee1.name || formF.nominee1Name || '', 10);
    setStyledField('nomineeAddress1', nominee1.address || formF.nominee1Address || '', 9);
    setStyledField('nomineeRelation1', nominee1.relationship || formF.nominee1Relationship || formF.nominee1Relation || '', 10);
    setStyledField('nomineeAge1', nominee1.age || formF.nominee1Age || '', 10);

    const nominee1Share = nominee1.sharePercent || nominee1.share || formF.nominee1Share || '';
    setStyledField('nomineeShare1', nominee1Share, 10);
    

    const nominee2 = formF.nominees?.[1] || formF.nominee2 || {};
    if (nominee2.name || formF.nominee2Name) {
      setStyledField('nomineeName2', nominee2.name || formF.nominee2Name || '', 10);
      setStyledField('nomineeAddress2', nominee2.address || formF.nominee2Address || '', 9);
      setStyledField('nomineeRelation2', nominee2.relationship || formF.nominee2Relationship || formF.nominee2Relation || '', 10);
      setStyledField('nomineeAge2', nominee2.age || formF.nominee2Age || '', 10);
      const nominee2Share = nominee2.sharePercent || nominee2.share || formF.nominee2Share || '';
      setStyledField('nomineeShare2', nominee2Share, 10);
    }
    

    setStyledField('nameWitness1', formF.witness1Name || formF.witness1 || '', 10);
    setStyledField('addressWitness1', formF.witness1Address || '', 9);
    setStyledField('nameWitness2', formF.witness2Name || formF.witness2 || '', 10);
    setStyledField('addressWitness2', formF.witness2Address || '', 9);
    


    try {

      await embedSignature(pdfDoc, form, 'witnessSign1_af_image', formF.witness1Signature);
      await embedSignature(pdfDoc, form, 'witnessSign2_af_image', formF.witness2Signature);
    } catch (e) {
      console.log('Witness image fields not found, trying button fields');
    }
    try {
      await embedSignature(pdfDoc, form, 'witnessSign1', formF.witness1Signature);
      await embedSignature(pdfDoc, form, 'witnessSign2', formF.witness2Signature);
    } catch (e) {
      console.log('Witness button fields not found either');
    }
    

    setStyledField('formDate', formatDate(formF.nominationDate || new Date()), 10);
    setStyledField('formPlace', formF.place || formF.declarationPlace || profile.currentCity || profile.city || '', 10);
    

    console.log('Form F - Embedding employee signature');
    await embedSignature(pdfDoc, form, 'SignatureofEmployee_af_image', 
      employeeSignature || formF.employeeSignature || profile.signature || profile.formFSignature);
    

    console.log('Form F - Embedding employer signature');
    await embedSignature(pdfDoc, form, 'SignatureofEmployer_af_image', adminSignature);
    

    
    return await pdfDoc.save();
  } catch (error) {
    console.error('Error filling Form F:', error);
    throw error;
  }
};














export const fillPFNomination = async (candidateData, employeeSignature, adminSignature) => {
  try {
    console.log('Fetching PF Nomination from:', PDF_BASE_PATH + '/PF_Nomination_Form.pdf');
    const response = await fetch(PDF_BASE_PATH + '/PF_Nomination_Form.pdf');
    console.log('PF Nomination fetch response:', response.status, response.statusText);
    if (!response.ok) throw new Error('Failed to fetch PF Nomination Form: ' + response.status);
    
    const pdfBytes = await response.arrayBuffer();
    console.log('PF Nomination PDF bytes loaded:', pdfBytes.byteLength);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    console.log('PF Nomination PDF loaded successfully');
    

    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    

    const setStyledField = (fieldName, value, fontSize = 10) => {
      try {
        const field = form.getTextField(fieldName);
        if (field && value !== undefined && value !== null && value !== '') {
          field.setText(String(value).trim());
          field.setFontSize(fontSize);
          field.defaultUpdateAppearances(helveticaFont);
        }
      } catch (e) {
        console.log('Field not found: ' + fieldName);
      }
    };
    

    const profile = candidateData.profileData || candidateData || {};
    const pfNom = candidateData.pfNominationData || profile.pfNominationData || {};
    const joining = candidateData.joiningFormData || profile.joiningFormData || {};
    

    const fullName = profile.fullName || 
                     [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ') ||
                     pfNom.employeeName || '';
    setStyledField('employeeName', fullName, 10);
    setStyledField('employeeFatherName', profile.fatherName || pfNom.fatherName || joining.fatherName || '', 10);
    
    const dob = profile.dateOfBirth || profile.dob || pfNom.dateOfBirth || joining.dateOfBirth || '';
    setStyledField('employeeDOB', formatDate(dob), 10);
    
    setStyledField('gender', profile.gender || pfNom.gender || joining.gender || '', 10);
    setStyledField('maritalStatus', profile.maritalStatus || pfNom.maritalStatus || joining.maritalStatus || '', 10);
    

    const permAddress = profile.permanentAddress || 
                        pfNom.permanentAddress || 
                        joining.permanentAddress ||
                        [profile.address, profile.city, profile.state, profile.pincode].filter(Boolean).join(', ') || '';
    setStyledField('permanentAddress', permAddress, 9);
    

    const nominee1 = pfNom.nominees?.[0] || pfNom.nominee1 || {};
    setStyledField('nomineeName1', nominee1.name || pfNom.nominee1Name || '', 10);
    setStyledField('nomineeAddress1', nominee1.address || pfNom.nominee1Address || '', 9);
    setStyledField('nomineeRelationship1', nominee1.relationship || pfNom.nominee1Relationship || '', 10);
    setStyledField('nomineeDOB1', formatDate(nominee1.dob || pfNom.nominee1DOB || ''), 10);
    setStyledField('nomineeShare1', nominee1.share || pfNom.nominee1Share || '100', 10);
    

    const nominee2 = pfNom.nominees?.[1] || pfNom.nominee2 || {};
    if (nominee2.name || pfNom.nominee2Name) {
      setStyledField('nomineeName2', nominee2.name || pfNom.nominee2Name || '', 10);
      setStyledField('nomineeAddress2', nominee2.address || pfNom.nominee2Address || '', 9);
      setStyledField('nomineeRelationship2', nominee2.relationship || pfNom.nominee2Relationship || '', 10);
      setStyledField('nomineeDOB2', formatDate(nominee2.dob || pfNom.nominee2DOB || ''), 10);
      setStyledField('nomineeShare2', nominee2.share || pfNom.nominee2Share || '', 10);
    }
    

    const guardianDetails = pfNom.minorGuardianDetails || pfNom.guardianDetails || '';
    if (guardianDetails || pfNom.minorGuardianName) {
      setStyledField('minorguardiandetails1', guardianDetails || 
        'Name: ' + (pfNom.minorGuardianName || '') + ', Address: ' + (pfNom.minorGuardianAddress || ''), 9);
    }
    

    const familyMembers = pfNom.epsFamilyMembers || pfNom.familyMembers || [];
    for (let i = 0; i < 5; i++) {
      const member = familyMembers[i] || pfNom['epsFamilyMember' + (i+1)] || {};
      setStyledField('epsfamilymembername' + (i+1), member.name || '', 9);
      setStyledField('epsfamilymemberAddress' + (i+1), member.address || '', 9);
      setStyledField('epsfamilymemberDOB' + (i+1), formatDate(member.dob || ''), 10);
      setStyledField('epsfamilymemberrelation' + (i+1), member.relationship || member.relation || '', 9);
    }
    

    const widowNominee = pfNom.widowNominee || {};
    setStyledField('nomineewidowpension', widowNominee.name || pfNom.widowNomineeName || '', 10);
    setStyledField('nomineewidowDOB', formatDate(widowNominee.dob || pfNom.widowNomineeDOB || ''), 10);
    setStyledField('nomineewidowrelation', widowNominee.relationship || pfNom.widowNomineeRelation || '', 10);
    

    setStyledField('formDate', formatDate(new Date()), 10);
    setStyledField('formPlace', pfNom.place || pfNom.declarationPlace || profile.currentCity || profile.city || 'New Delhi', 10);
    

    try {
      await embedSignature(pdfDoc, form, 'signatureOfemployee_af_image', 
        employeeSignature || pfNom.employeeSignature || profile.signature);
    } catch (e) {
      console.log('Employee signature field issue: ' + e.message);
    }
    await embedSignature(pdfDoc, form, 'signatureOfemployer_af_image', adminSignature);
    

    
    return await pdfDoc.save();
  } catch (error) {
    console.error('Error filling PF Nomination Form:', error);
    throw error;
  }
};





export const generateEmployeeJoiningForm = async (candidateData, employeeSignature) => {
  const profile = candidateData.profileData || candidateData || {};
  const joining = candidateData.joiningFormData || profile.joiningFormData || {};
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 15;
  

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYEE JOINING FORM', pageWidth / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('ESME Consumer (P) Ltd', pageWidth / 2, y, { align: 'center' });
  y += 8;
  
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;
  
  const fullName = profile.fullName || [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ') || '';
  

  const safeValue = (val) => {
    if (val === undefined || val === null || val === 'undefined' || val === 'null') {
      return '';
    }
    return String(val).replace(/undefined/g, '').replace(/null/g, '').trim();
  };
  

  const addRow = (label, value, width = 85) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', margin, y);
    doc.setFont('helvetica', 'normal');
    const valueText = safeValue(value) || 'N/A';
    doc.text(valueText.substring(0, 50), margin + 45, y);
    return 5;
  };
  
  const addSection = (title) => {
    y += 3;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 3, pageWidth - 2 * margin, 6, 'F');
    doc.text(title, margin + 2, y + 1);
    y += 8;
  };
  

  addSection('PERSONAL INFORMATION');
  y += addRow('Full Name', fullName);
  y += addRow('Date of Birth', formatDate(profile.dateOfBirth || profile.dob || joining.dateOfBirth));
  y += addRow('Gender', profile.gender || joining.gender);
  y += addRow("Father's Name", profile.fatherName || joining.fatherName);
  y += addRow('Marital Status', profile.maritalStatus || joining.maritalStatus);
  y += addRow('Blood Group', profile.bloodGroup || joining.bloodGroup);
  y += addRow('Nationality', profile.nationality || 'Indian');
  y += addRow('Religion', profile.religion || joining.religion);
  

  addSection('CONTACT DETAILS');
  y += addRow('Mobile Number', profile.mobileNumber || profile.phone || joining.mobileNumber);
  y += addRow('Email (Personal)', profile.email || profile.personalEmail || joining.personalEmail);
  y += addRow('Email (Official)', profile.officialEmail || joining.officialEmail);
  y += addRow('Emergency Contact', joining.emergencyContactName);
  y += addRow('Emergency Phone', joining.emergencyContactPhone);
  

  addSection('CURRENT ADDRESS');
  y += addRow('Address', (profile.currentAddress || profile.address || joining.currentAddress || '').substring(0, 60));
  y += addRow('City', profile.currentCity || profile.city || joining.currentCity);
  y += addRow('State', profile.currentState || profile.state || joining.currentState);
  y += addRow('Pincode', profile.currentPincode || profile.pincode || joining.currentPincode);
  

  addSection('PERMANENT ADDRESS');
  y += addRow('Address', (profile.permanentAddress || joining.permanentAddress || '').substring(0, 60));
  y += addRow('City', profile.permanentCity || joining.permanentCity);
  y += addRow('State', profile.permanentState || joining.permanentState);
  y += addRow('Pincode', profile.permanentPincode || joining.permanentPincode);
  

  addSection('IDENTITY DOCUMENTS');

  const aadhaarVal = profile.aadhaarNumber || profile.aadharNumber || joining.aadhaarNumber || joining.aadharNumber || '';
  const cleanAadhaar = String(aadhaarVal).replace(/undefined/g, '').replace(/null/g, '').trim();
  y += addRow('Aadhaar Number', cleanAadhaar);
  y += addRow('PAN Number', profile.panNumber || joining.panNumber);
  y += addRow('Passport Number', profile.passportNumber || joining.passportNumber);
  

  addSection('BANK DETAILS');
  y += addRow('Bank Name', profile.bankName || joining.bankName);
  y += addRow('Account Number', profile.bankAccountNumber || profile.accountNumber || joining.bankAccountNumber);
  y += addRow('IFSC Code', profile.ifscCode || profile.bankIfscCode || joining.ifscCode);
  y += addRow('Branch', profile.bankBranch || joining.bankBranch);
  

  addSection('EMPLOYMENT DETAILS');
  y += addRow('Department', profile.department || joining.department);
  y += addRow('Designation', profile.designation || joining.designation);
  y += addRow('Date of Joining', formatDate(profile.dateOfJoining || joining.dateOfJoining));
  y += addRow('Employee ID', profile.employeeId || joining.employeeId || 'To be assigned');
  

  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  y += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('I hereby declare that all the information provided above is true and correct to the best of my knowledge.', margin, y);
  y += 15;
  
  doc.text('Place: ' + (joining.declarationPlace || profile.currentCity || profile.city || '____________'), margin, y);
  doc.text('Date: ' + formatDate(new Date()), pageWidth - margin - 40, y);
  
  y += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Signature:', margin, y);
  
  const rawSig = employeeSignature || profile.signature || joining.employeeSignature;
  if (rawSig) {
    try {

      const sig = await processSignatureForPDF(rawSig);
      if (sig) {
        doc.addImage(sig, 'PNG', margin, y + 3, 40, 15);
      }
    } catch (e) {
      console.log('Signature image error:', e.message);
    }
  }
  
  doc.text('(' + fullName + ')', margin, y + 25);
  
  return doc.output('arraybuffer');
};

export const generateMedicalInsuranceForm = async (candidateData, employeeSignature) => {
  const profile = candidateData.profileData || candidateData || {};
  const medical = candidateData.medicalInsuranceData || profile.medicalInsuranceData || candidateData.insuranceData || profile.insuranceData || {};
  const joining = candidateData.joiningFormData || profile.joiningFormData || {};
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 15;
  

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('MEDICAL INSURANCE ENROLLMENT FORM', pageWidth / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('ESME Consumer (P) Ltd', pageWidth / 2, y, { align: 'center' });
  y += 8;
  
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;
  
  const fullName = profile.fullName || [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ') || '';
  

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y - 3, pageWidth - 2 * margin, 6, 'F');
  doc.text('EMPLOYEE DETAILS', margin + 2, y + 1);
  y += 10;
  
  const addRow = (label, value) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value || 'N/A'), margin + 50, y);
    y += 5;
  };
  
  addRow('Employee Name', fullName);
  addRow('Employee ID', profile.employeeId || medical.employeeId || 'To be assigned');
  addRow('Department', profile.department || medical.department || joining.department);
  addRow('Designation', profile.designation || medical.designation || joining.designation);
  addRow('Date of Birth', formatDate(profile.dateOfBirth || profile.dob || joining.dateOfBirth));
  addRow('Gender', profile.gender || joining.gender);
  addRow('Blood Group', profile.bloodGroup || medical.bloodGroup || joining.bloodGroup);
  addRow('Marital Status', profile.maritalStatus || joining.maritalStatus);
  addRow('Contact Number', profile.mobileNumber || profile.phone || joining.mobileNumber);
  addRow('Email', profile.email || profile.personalEmail || joining.personalEmail);
  addRow('Address', (profile.currentAddress || profile.address || joining.currentAddress || '').substring(0, 50));
  

  y += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y - 3, pageWidth - 2 * margin, 6, 'F');
  doc.text('DEPENDENT DETAILS', margin + 2, y + 1);
  y += 10;
  

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  const cols = [margin, margin + 8, margin + 55, margin + 85, margin + 110, margin + 135, margin + 160];
  doc.text('S.No', cols[0], y);
  doc.text('Name', cols[1], y);
  doc.text('Relationship', cols[2], y);
  doc.text('DOB', cols[3], y);
  doc.text('Gender', cols[4], y);
  doc.text('Aadhaar', cols[5], y);
  y += 3;
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;
  
  doc.setFont('helvetica', 'normal');
  const dependents = medical.dependents || [];
  
  if (dependents.length === 0) {
    doc.text('No dependents added', margin, y);
    y += 5;
  } else {
    dependents.forEach((dep, i) => {
      doc.text(String(i + 1), cols[0], y);
      doc.text((dep.name || '').substring(0, 20), cols[1], y);
      doc.text((dep.relationship || '').substring(0, 12), cols[2], y);
      doc.text(formatDate(dep.dob), cols[3], y);
      doc.text((dep.gender || '').substring(0, 6), cols[4], y);
      doc.text((dep.aadhaar || '').substring(0, 12), cols[5], y);
      y += 5;
    });
  }
  

  y += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('I hereby declare that the above information is true and correct to the best of my knowledge.', margin, y);
  doc.text('I understand that providing false information may result in denial of claims.', margin, y + 4);
  
  y += 20;
  doc.setFont('helvetica', 'normal');
  doc.text('Place: ' + (medical.place || profile.currentCity || profile.city || '____________'), margin, y);
  doc.text('Date: ' + formatDate(new Date()), pageWidth - margin - 40, y);
  
  y += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Signature:', margin, y);
  
  const rawSig = employeeSignature || profile.signature || medical.employeeSignature;
  if (rawSig) {
    try {

      const sig = await processSignatureForPDF(rawSig);
      if (sig) {
        doc.addImage(sig, 'PNG', margin, y + 3, 40, 15);
      }
    } catch (e) {
      console.log('Signature image error:', e.message);
    }
  }
  
  return doc.output('arraybuffer');
};

export const generateSelfDeclarationForm = async (candidateData, employeeSignature) => {
  const profile = candidateData.profileData || candidateData || {};
  const decl = candidateData.selfDeclarationData || profile.selfDeclarationData || {};
  const joining = candidateData.joiningFormData || profile.joiningFormData || {};
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 15;
  

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SELF DECLARATION FORM', pageWidth / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('ESME Consumer (P) Ltd', pageWidth / 2, y, { align: 'center' });
  y += 8;
  
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;
  
  const fullName = profile.fullName || [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(' ') || '';
  

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y - 3, pageWidth - 2 * margin, 6, 'F');
  doc.text('EMPLOYEE DETAILS', margin + 2, y + 1);
  y += 10;
  
  const addRow = (label, value) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value || 'N/A'), margin + 50, y);
    y += 5;
  };
  
  addRow('Full Name', fullName);
  addRow("Father's Name", profile.fatherName || joining.fatherName);
  addRow('Date of Birth', formatDate(profile.dateOfBirth || profile.dob || joining.dateOfBirth));
  addRow('Permanent Address', (profile.permanentAddress || joining.permanentAddress || '').substring(0, 50));
  addRow('Aadhaar Number', profile.aadhaarNumber || profile.aadharNumber || joining.aadhaarNumber);
  addRow('PAN Number', profile.panNumber || joining.panNumber);
  

  y += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y - 3, pageWidth - 2 * margin, 6, 'F');
  doc.text('PREVIOUS EMPLOYMENT DETAILS', margin + 2, y + 1);
  y += 10;
  
  addRow('Previous Employer', decl.previousEmployer || joining.previousEmployer || 'N/A');
  addRow('Designation', decl.previousDesignation || joining.previousDesignation || 'N/A');
  addRow('Employment Period', decl.employmentPeriod || 'N/A');
  addRow('Reason for Leaving', decl.reasonForLeaving || 'N/A');
  

  y += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y - 3, pageWidth - 2 * margin, 6, 'F');
  doc.text('DECLARATION', margin + 2, y + 1);
  y += 10;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  const declarations = [
    '1. I hereby declare that all the information provided by me in this form and supporting',
    '   documents is true, complete, and correct to the best of my knowledge and belief.',
    '',
    '2. I understand that if any information provided by me is found to be false or misleading,',
    '   it may result in termination of my employment without notice.',
    '',
    '3. I have not been convicted of any criminal offense and there are no pending criminal',
    '   cases against me.',
    '',
    '4. I am not related to any employee of the company. If related, I have disclosed the',
    '   relationship to the HR department.',
    '',
    '5. I agree to abide by all the rules, regulations, and policies of the company.',
    '',
    '6. I authorize the company to verify my credentials and background as deemed necessary.'
  ];
  
  declarations.forEach(line => {
    doc.text(line, margin, y);
    y += 4;
  });
  

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.text('Place: ' + (decl.place || profile.currentCity || profile.city || '____________'), margin, y);
  doc.text('Date: ' + formatDate(new Date()), pageWidth - margin - 40, y);
  
  y += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Signature:', margin, y);
  
  const rawSig = employeeSignature || profile.signature || decl.employeeSignature;
  if (rawSig) {
    try {

      const sig = await processSignatureForPDF(rawSig);
      if (sig) {
        doc.addImage(sig, 'PNG', margin, y + 3, 40, 15);
      }
    } catch (e) {
      console.log('Signature image error:', e.message);
    }
  }
  
  y += 25;
  doc.setFont('helvetica', 'normal');
  doc.text('(' + fullName + ')', margin, y);
  
  return doc.output('arraybuffer');
};






const viewPDF = (pdfBytes) => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  

  const newWindow = window.open(url, '_blank');
  if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {

    console.log('Popup blocked, downloading instead');
    const link = document.createElement('a');
    link.href = url;
    link.download = 'form.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};


const downloadPDF = (pdfBytes, filename) => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};


export const viewFormPDF = async (formId, profileData, adminSignature) => {
  try {
    const candidateData = { profileData };
    


    const employeeSignature = 
      profileData.signature || 
      profileData.form11Signature ||
      profileData.formFSignature ||
      profileData.pfNominationSignature ||
      profileData.insuranceSignature ||
      profileData.selfDeclarationSignature ||
      profileData.form11Data?.employeeSignature ||
      profileData.formFData?.employeeSignature ||
      profileData.pfNominationData?.employeeSignature ||
      profileData.joiningFormData?.employeeSignature ||
      profileData.medicalInsuranceData?.employeeSignature ||
      profileData.selfDeclarationData?.employeeSignature ||
      null;
    
    console.log('Employee signature found:', !!employeeSignature);
    console.log('Admin signature found:', !!adminSignature);
    console.log('Form ID requested:', formId);
    
    let pdfBytes;
    switch(formId) {
      case 'form_11':
        console.log('Generating Form 11...');
        pdfBytes = await fillForm11(candidateData, employeeSignature, adminSignature);
        break;
      case 'form_f':
        console.log('Generating Form F...');
        pdfBytes = await fillFormF(candidateData, employeeSignature, adminSignature);
        break;
      case 'pf_nomination':
        console.log('Generating PF Nomination...');
        pdfBytes = await fillPFNomination(candidateData, employeeSignature, adminSignature);
        break;
      case 'joining':
        console.log('Generating Joining Form...');
        pdfBytes = await generateEmployeeJoiningForm(candidateData, employeeSignature);
        break;
      case 'insurance':
        console.log('Generating Medical Insurance Form...');
        pdfBytes = await generateMedicalInsuranceForm(candidateData, employeeSignature);
        break;
      case 'self_declaration':
        console.log('Generating Self Declaration Form...');
        pdfBytes = await generateSelfDeclarationForm(candidateData, employeeSignature);
        break;
      default:
        throw new Error('Unknown form type: ' + formId);
    }
    
    console.log('PDF bytes generated, size:', pdfBytes?.byteLength || pdfBytes?.length || 0);
    viewPDF(pdfBytes);
    console.log('viewPDF called successfully');
  } catch (error) {
    console.error('Error viewing form:', error);
    alert('Error generating PDF: ' + error.message);
  }
};


export const downloadFormPDF = async (formId, profileData, candidateName, adminSignature) => {
  try {
    const candidateData = { profileData };
    

    const employeeSignature = 
      profileData.signature || 
      profileData.form11Signature ||
      profileData.formFSignature ||
      profileData.pfNominationSignature ||
      profileData.insuranceSignature ||
      profileData.selfDeclarationSignature ||
      profileData.form11Data?.employeeSignature ||
      profileData.formFData?.employeeSignature ||
      profileData.pfNominationData?.employeeSignature ||
      profileData.joiningFormData?.employeeSignature ||
      profileData.medicalInsuranceData?.employeeSignature ||
      profileData.selfDeclarationData?.employeeSignature ||
      null;
    
    const safeName = (candidateName || 'candidate').replace(/[^a-zA-Z0-9]/g, '_');
    
    let pdfBytes;
    let filename;
    
    switch(formId) {
      case 'form_11':
        pdfBytes = await fillForm11(candidateData, employeeSignature, adminSignature);
        filename = safeName + '_Form_11.pdf';
        break;
      case 'form_f':
        pdfBytes = await fillFormF(candidateData, employeeSignature, adminSignature);
        filename = safeName + '_Form_F.pdf';
        break;
      case 'pf_nomination':
        pdfBytes = await fillPFNomination(candidateData, employeeSignature, adminSignature);
        filename = safeName + '_PF_Nomination.pdf';
        break;
      case 'joining':
        pdfBytes = await generateEmployeeJoiningForm(candidateData, employeeSignature);
        filename = safeName + '_Joining_Form.pdf';
        break;
      case 'insurance':
        pdfBytes = await generateMedicalInsuranceForm(candidateData, employeeSignature);
        filename = safeName + '_Medical_Insurance.pdf';
        break;
      case 'self_declaration':
        pdfBytes = await generateSelfDeclarationForm(candidateData, employeeSignature);
        filename = safeName + '_Self_Declaration.pdf';
        break;
      default:
        throw new Error('Unknown form type: ' + formId);
    }
    
    downloadPDF(pdfBytes, filename);
  } catch (error) {
    console.error('Error downloading form:', error);
    alert('Error generating PDF: ' + error.message);
  }
};


export const generateAllForms = async (candidateData, adminSignature) => {
  const profile = candidateData.profileData || candidateData || {};
  

  const employeeSignature = 
    profile.signature || 
    profile.form11Signature ||
    profile.formFSignature ||
    profile.pfNominationSignature ||
    profile.insuranceSignature ||
    profile.selfDeclarationSignature ||
    profile.form11Data?.employeeSignature ||
    profile.formFData?.employeeSignature ||
    profile.pfNominationData?.employeeSignature ||
    profile.joiningFormData?.employeeSignature ||
    profile.medicalInsuranceData?.employeeSignature ||
    profile.selfDeclarationData?.employeeSignature ||
    candidateData.signature ||
    null;
  
  const forms = await Promise.all([
    fillForm11(candidateData, employeeSignature, adminSignature),
    fillFormF(candidateData, employeeSignature, adminSignature),
    fillPFNomination(candidateData, employeeSignature, adminSignature),
    generateEmployeeJoiningForm(candidateData, employeeSignature),
    generateMedicalInsuranceForm(candidateData, employeeSignature),
    generateSelfDeclarationForm(candidateData, employeeSignature)
  ]);
  
  return {
    form11: forms[0],
    formF: forms[1],
    pfNomination: forms[2],
    joiningForm: forms[3],
    insuranceForm: forms[4],
    selfDeclaration: forms[5]
  };
};
