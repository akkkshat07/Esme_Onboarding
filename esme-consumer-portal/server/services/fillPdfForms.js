import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Fill Form 11 (PF Nomination Form) with user data
 */
async function embedSignatureInField(pdfDoc, form, fieldName, signatureDataUrl) {
  if (!signatureDataUrl) {
    console.log(`  ⚠️ No signature data for field: ${fieldName}`);
    return;
  }
  try {
    console.log(`  🖋️ Attempting to embed signature in field: ${fieldName}`);
    // signatureDataUrl looks like: data:image/png;base64,AAAA...
    const matches = signatureDataUrl.match(/^data:(image\/(png|jpeg|jpg));base64,(.+)$/);
    if (!matches) {
      console.log(`  ⚠️ Invalid signature data URL format for ${fieldName}`);
      return;
    }
    const base64 = matches[3];
    const imageBytes = Buffer.from(base64, 'base64');
    console.log(`  ✓ Decoded signature image: ${imageBytes.length} bytes`);

    // Attempt to find the field and its widget rectangle to place the image
    const field = form.getFields().find(f => f.getName() === fieldName);
    if (!field) {
      console.log(`  ⚠️ Field not found: ${fieldName}`);
      return;
    }
    console.log(`  ✓ Found field: ${fieldName} (${field.constructor.name})`);
    console.log(`  ✓ Found field: ${fieldName} (${field.constructor.name})`);

    // Low-level access to widget and page
    const widgets = field.acroField?.getWidgets?.();
    if (!widgets || widgets.length === 0) {
      console.log(`  ⚠️ No widgets found for field: ${fieldName}`);
      return;
    }
    console.log(`  ✓ Found ${widgets.length} widget(s)`);

    const widget = widgets[0];
    const rect = widget.getRectangle();
    
    // Get the page - try multiple methods
    const pageRef = widget.P?.() || widget.dict?.get?.('P');
    const pages = pdfDoc.getPages();
    let page = null;
    
    if (pageRef) {
      page = pages.find(p => p.ref === pageRef);
    }
    
    // Fallback: try to get page from annotation appearance
    if (!page && widgets.length > 0) {
      // Try each widget to find one with a valid page
      for (const w of widgets) {
        const pRef = w.P?.() || w.dict?.get?.('P');
        if (pRef) {
          page = pages.find(p => p.ref === pRef);
          if (page) break;
        }
      }
    }
    
    // Last resort: use first page (most signature fields are on page 1)
    if (!page) {
      page = pages[0];
      console.log(`  ⚠️ Using first page as fallback for: ${fieldName}`);
    }
    
    if (!rect || !page) {
      console.log(`  ⚠️ No rectangle or page for widget: ${fieldName}`);
      return;
    }
    console.log(`  ✓ Widget rectangle:`, rect);
    console.log(`  ✓ Widget rectangle:`, rect);

    // rect can be object {x, y, width, height} or array [x1, y1, x2, y2]
    let x1, y1, width, height;
    
    if (Array.isArray(rect)) {
      x1 = rect[0];
      y1 = rect[1];
      const x2 = rect[2];
      const y2 = rect[3];
      width = x2 - x1;
      height = y2 - y1;
    } else if (rect.x !== undefined) {
      x1 = rect.x;
      y1 = rect.y;
      width = rect.width;
      height = rect.height;
    } else {
      console.log(`  ⚠️ Invalid rectangle format for: ${fieldName}`);
      return;
    }
    
    console.log(`  ✓ Calculated dimensions: ${width}x${height} at (${x1}, ${y1})`);

    // embed appropriate image type
    let embeddedImage;
    const mime = matches[1];
    if (mime === 'image/png') embeddedImage = await pdfDoc.embedPng(imageBytes);
    else embeddedImage = await pdfDoc.embedJpg(imageBytes);
    console.log(`  ✓ Image embedded successfully (${mime})`);

    // Draw image on the page at the widget rect (pdf-lib uses bottom-left origin)
    page.drawImage(embeddedImage, {
      x: x1,
      y: y1,
      width,
      height
    });
    console.log(`  ✅ Signature drawn on page for field: ${fieldName}`);
  } catch (err) {
    console.warn(`  ❌ Could not embed signature for field ${fieldName}:`, err.message);
  }
}

export async function fillForm11(formData, requestorEmail) {
  try {
    console.log('Form 11 - Received formData:', JSON.stringify(formData, null, 2));
    
    const pdfPath = path.join(__dirname, '../../public/forms/Form 11.pdf');
    const pdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // Try to fetch saved signature for this user (if email provided)
    let signatureDataUrl = null;
    try {
      if (requestorEmail) {
        const user = await User.findOne({ email: requestorEmail });
        if (user && user.signature && user.signature.signatureImage) {
          signatureDataUrl = user.signature.signatureImage;
        }
      }
    } catch (err) {
      console.warn('Could not fetch user signature for', requestorEmail, err && err.message);
    }

    // Get all field names to see what's available
    const fields = form.getFields();
    console.log('Form 11 Fields:', fields.map(f => f.getName()));

    // Fill the form fields using ACTUAL field names from the PDF
    try {
      // Member Name (split into first, middle, last)
      if (formData.name) {
        const nameParts = formData.name.split(' ');
        if (nameParts[0]) form.getTextField('memberFirstName').setText(nameParts[0]);
        if (nameParts[1] && nameParts.length === 3) form.getTextField('memberMiddleName').setText(nameParts[1]);
        if (nameParts.length === 2) form.getTextField('memberLastName').setText(nameParts[1]);
        if (nameParts.length === 3) form.getTextField('memberLastName').setText(nameParts[2]);
        form.getTextField('memberName').setText(formData.name);
      }
      
      // Father's Name
      if (formData.fatherName) {
        const fatherParts = formData.fatherName.split(' ');
        if (fatherParts[0]) form.getTextField('FatherFirstName').setText(fatherParts[0]);
        if (fatherParts[1] && fatherParts.length === 3) form.getTextField('FatherMiddleName').setText(fatherParts[1]);
        if (fatherParts.length === 2) form.getTextField('FatherLastName').setText(fatherParts[1]);
        if (fatherParts.length === 3) form.getTextField('FatherLastName').setText(fatherParts[2]);
        form.getCheckBox('Father').check();
      }
      
      // Date of Birth (split into Day, Month, Year)
      if (formData.dob) {
        const dobParts = formData.dob.split('-'); // Assuming YYYY-MM-DD format
        if (dobParts.length === 3) {
          form.getTextField('Year').setText(dobParts[0]);
          form.getTextField('Month').setText(dobParts[1]);
          form.getTextField('Day').setText(dobParts[2]);
        }
      }
      
      // Gender checkboxes
      if (formData.gender) {
        if (formData.gender.toLowerCase() === 'male' || formData.gender === 'M') {
          form.getCheckBox('Male').check();
        } else if (formData.gender.toLowerCase() === 'female' || formData.gender === 'F') {
          form.getCheckBox('Female').check();
        } else if (formData.gender.toLowerCase() === 'transgender') {
          form.getCheckBox('Transgender').check();
        }
      }
      
      // Marital Status
      if (formData.maritalStatus) {
        const status = formData.maritalStatus.toLowerCase();
        if (status === 'married') form.getCheckBox('married').check();
        else if (status === 'unmarried' || status === 'single') form.getCheckBox('unmarried').check();
        else if (status === 'widow' || status === 'widower') form.getCheckBox('widow/widower').check();
        else if (status === 'divorced') form.getCheckBox('divorcee').check();
      }
      
      // Contact - Fill email even if truncated
      if (formData.mobileNumber) form.getTextField('mobile').setText(formData.mobileNumber);
      if (formData.emailId) {
        try {
          form.getTextField('email').setText(formData.emailId);
        } catch (e) {
          console.log('Email field warning:', e.message);
        }
      }
      
      // IDs
      if (formData.aadhaarNumber) form.getTextField('aadharNumber').setText(formData.aadhaarNumber);
      if (formData.panNumber) form.getTextField('panNumber').setText(formData.panNumber);
      if (formData.uanNumber) form.getTextField('uanNumber').setText(formData.uanNumber);
      
      // Bank Details
      if (formData.accountNumber) form.getTextField('accountNumber').setText(formData.accountNumber);
      if (formData.ifscCode) form.getTextField('ifscCode').setText(formData.ifscCode);
      
      // Education
      if (formData.highestQualification) {
        const qual = formData.highestQualification.toLowerCase();
        if (qual.includes('10th') || qual.includes('tenth')) form.getCheckBox('10th').check();
        else if (qual.includes('12th') || qual.includes('twelfth')) form.getCheckBox('12th').check();
        else if (qual.includes('graduate') || qual.includes('bachelor')) form.getCheckBox('graduate').check();
        else if (qual.includes('post') || qual.includes('master')) form.getCheckBox('postgraduate').check();
        else if (qual.includes('phd') || qual.includes('doctorate')) form.getCheckBox('phd').check();
        else if (qual.includes('diploma')) form.getCheckBox('diploma').check();
      }
      
      // Form Date and Place
      if (formData.date) form.getTextField('formDate').setText(formData.date);
      if (formData.place) form.getTextField('formPlace').setText(formData.place);
      
    } catch (fieldError) {
      console.warn('Some fields could not be filled:', fieldError.message);
    }

    // Embed signature image if present
    if (signatureDataUrl) {
      await embedSignatureInField(pdfDoc, form, 'signatureOfemployee_af_image', signatureDataUrl);
      // also try common variants
      await embedSignatureInField(pdfDoc, form, 'SignatureofEmployee_af_image', signatureDataUrl);
    }

    const filledPdfBytes = await pdfDoc.save();
    return Buffer.from(filledPdfBytes);
  } catch (error) {
    console.error('Error filling Form 11:', error);
    throw error;
  }
}

/**
 * Fill Form F (Gratuity Nomination Form) with user data
 */
export async function fillFormF(formData, requestorEmail) {
  try {
    console.log('Form F - Received formData:', JSON.stringify(formData, null, 2));
    
    const pdfPath = path.join(__dirname, '../../public/forms/FORM_F.PDF');
    const pdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // Try to fetch saved signature for this user (if email provided)
    let signatureDataUrl = null;
    try {
      if (requestorEmail) {
        const user = await User.findOne({ email: requestorEmail });
        if (user && user.signature && user.signature.signatureImage) {
          signatureDataUrl = user.signature.signatureImage;
        }
      }
    } catch (err) {
      console.warn('Could not fetch user signature for', requestorEmail, err && err.message);
    }

    const fields = form.getFields();
    console.log('Form F Fields:', fields.map(f => f.getName()));

    try {
      // Employee Details
      if (formData.employeeName) form.getTextField('employeeName').setText(formData.employeeName);
      if (formData.gender) form.getTextField('gender').setText(formData.gender);
      if (formData.religion) form.getTextField('religion').setText(formData.religion);
      if (formData.maritalStatus) form.getTextField('maritalStatus').setText(formData.maritalStatus);
      if (formData.department) form.getTextField('department').setText(formData.department);
      if (formData.dateOfJoining) form.getTextField('dateOfJoining').setText(formData.dateOfJoining);
      
      // Establishment Details
      if (formData.establishmentName) {
        form.getTextField('Give here name or description of the establishment with full address').setText(formData.establishmentName);
      }
      if (formData.establishmentAddress) form.getTextField('Or rubber stamp thereof').setText(formData.establishmentAddress);
      
      // Address components
      if (formData.village) form.getTextField('Village').setText(formData.village);
      if (formData.thana) form.getTextField('Thana').setText(formData.thana);
      if (formData.subdivision) form.getTextField('subdivision').setText(formData.subdivision);
      if (formData.postOffice) form.getTextField('Post office').setText(formData.postOffice);
      if (formData.district) form.getTextField('District').setText(formData.district);
      if (formData.state) form.getTextField('State').setText(formData.state);
      
      // Nominees (up to 2)
      if (formData.nominees && formData.nominees.length > 0) {
        if (formData.nominees[0]) {
          if (formData.nominees[0].name) form.getTextField('nomineeName1').setText(formData.nominees[0].name);
          if (formData.nominees[0].address) form.getTextField('nomineeAddress1').setText(formData.nominees[0].address);
          if (formData.nominees[0].relationship) form.getTextField('nomineeRelation1').setText(formData.nominees[0].relationship);
          if (formData.nominees[0].age) form.getTextField('nomineeAge1').setText(formData.nominees[0].age.toString());
          if (formData.nominees[0].share) form.getTextField('nomineeShare1').setText(formData.nominees[0].share.toString());
        }
        if (formData.nominees[1]) {
          if (formData.nominees[1].name) form.getTextField('nomineeName2').setText(formData.nominees[1].name);
          if (formData.nominees[1].address) form.getTextField('nomineeAddress2').setText(formData.nominees[1].address);
          if (formData.nominees[1].relationship) form.getTextField('nomineeRelation2').setText(formData.nominees[1].relationship);
          if (formData.nominees[1].age) form.getTextField('nomineeAge2').setText(formData.nominees[1].age.toString());
          if (formData.nominees[1].share) form.getTextField('nomineeShare2').setText(formData.nominees[1].share.toString());
        }
      }
      
      // Witnesses
      if (formData.witnesses && formData.witnesses.length > 0) {
        if (formData.witnesses[0] && formData.witnesses[0].name) {
          form.getTextField('nameWitness1').setText(formData.witnesses[0].name);
        }
        if (formData.witnesses[1] && formData.witnesses[1].name) {
          form.getTextField('nameWitness2').setText(formData.witnesses[1].name);
        }
      }
      
      // Form Date and Place
      if (formData.date) form.getTextField('formDate').setText(formData.date);
      if (formData.place) form.getTextField('formPlace').setText(formData.place);
      
    } catch (fieldError) {
      console.warn('Some fields could not be filled:', fieldError.message);
    }

    // Embed signature(s) if present
    if (signatureDataUrl) {
      await embedSignatureInField(pdfDoc, form, 'SignatureofEmployee_af_image', signatureDataUrl);
      await embedSignatureInField(pdfDoc, form, 'SignatureofEmployee_af_image', signatureDataUrl);
      // try common employee field name
      await embedSignatureInField(pdfDoc, form, 'signatureOfemployee_af_image', signatureDataUrl);
    }

    const filledPdfBytes = await pdfDoc.save();
    return Buffer.from(filledPdfBytes);
  } catch (error) {
    console.error('Error filling Form F:', error);
    throw error;
  }
}

/**
 * Fill Form 2 (PF Nomination) with user data
 */
export async function fillForm2(formData, requestorEmail) {
  try {
    console.log('Form 2 - Received formData:', JSON.stringify(formData, null, 2));
    
    const pdfPath = path.join(__dirname, '../../public/forms/PF_Nomination_Form.pdf');
    const pdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // Try to fetch saved signature for this user (if email provided)
    let signatureDataUrl = null;
    try {
      if (requestorEmail) {
        const user = await User.findOne({ email: requestorEmail });
        if (user && user.signature && user.signature.signatureImage) {
          signatureDataUrl = user.signature.signatureImage;
        }
      }
    } catch (err) {
      console.warn('Could not fetch user signature for', requestorEmail, err && err.message);
    }

    const fields = form.getFields();
    console.log('Form 2 Fields:', fields.map(f => f.getName()));

    try {
      // Employee Details
      if (formData.name) form.getTextField('employeeName').setText(formData.name);
      if (formData.fatherName) form.getTextField('employeeFatherName').setText(formData.fatherName);
      if (formData.dob) form.getTextField('employeeDOB').setText(formData.dob);
      if (formData.gender) form.getTextField('gender').setText(formData.gender);
      if (formData.maritalStatus) form.getTextField('maritalStatus').setText(formData.maritalStatus);
      if (formData.address) form.getTextField('permanentAddress').setText(formData.address);
      
      // EPF Nominees (up to 2) - Note: DOB fields may have maxLength constraints
      if (formData.epfNominees && formData.epfNominees.length > 0) {
        if (formData.epfNominees[0]) {
          if (formData.epfNominees[0].name) form.getTextField('nomineeName1').setText(formData.epfNominees[0].name);
          if (formData.epfNominees[0].address) form.getTextField('nomineeAddress1').setText(formData.epfNominees[0].address);
          if (formData.epfNominees[0].relationship) form.getTextField('nomineeRelationship1').setText(formData.epfNominees[0].relationship);
          if (formData.epfNominees[0].dob) {
            // Try to extract just day if field has maxLength constraint
            const dobParts = formData.epfNominees[0].dob.split('-');
            if (dobParts.length === 3) {
              try {
                form.getTextField('nomineeDOB1').setText(dobParts[2]); // Just the day (DD)
              } catch (e) {
                console.log('Could not set nomineeDOB1:', e.message);
              }
            }
          }
          if (formData.epfNominees[0].share) form.getTextField('nomineeShare1').setText(formData.epfNominees[0].share.toString());
          if (formData.epfNominees[0].guardianName) form.getTextField('minorguardiandetails1').setText(formData.epfNominees[0].guardianName);
        }
        if (formData.epfNominees[1]) {
          if (formData.epfNominees[1].name) form.getTextField('nomineeName2').setText(formData.epfNominees[1].name);
          if (formData.epfNominees[1].address) form.getTextField('nomineeAddress2').setText(formData.epfNominees[1].address);
          if (formData.epfNominees[1].relationship) form.getTextField('nomineeRelationship2').setText(formData.epfNominees[1].relationship);
          if (formData.epfNominees[1].dob) {
            const dobParts = formData.epfNominees[1].dob.split('-');
            if (dobParts.length === 3) {
              try {
                form.getTextField('nomineeDOB2').setText(dobParts[2]); // Just the day (DD)
              } catch (e) {
                console.log('Could not set nomineeDOB2:', e.message);
              }
            }
          }
          if (formData.epfNominees[1].share) form.getTextField('nomineeShare2').setText(formData.epfNominees[1].share.toString());
        }
      }
      
      // EPS Family Members (up to 5) - Note: DOB fields may have maxLength constraints
      if (formData.familyMembers && formData.familyMembers.length > 0) {
        for (let i = 0; i < Math.min(formData.familyMembers.length, 5); i++) {
          const member = formData.familyMembers[i];
          const index = i + 1;
          if (member.name) form.getTextField(`epsfamilymembername${index}`).setText(member.name);
          if (member.relationship) form.getTextField(`epsfamilymemberrelation${index}`).setText(member.relationship);
          if (member.dob) {
            const dobParts = member.dob.split('-');
            if (dobParts.length === 3) {
              try {
                form.getTextField(`epsfamilymemberDOB${index}`).setText(dobParts[2]); // Just the day (DD)
              } catch (e) {
                console.log(`Could not set epsfamilymemberDOB${index}:`, e.message);
              }
            }
          }
          if (member.address) form.getTextField(`epsfamilymemberAddress${index}`).setText(member.address);
        }
      }
      
      // EPS Nominee (for pension) - Note: DOB has maxLength=2
      if (formData.epsNominee) {
        if (formData.epsNominee.name) form.getTextField('nomineewidowpension').setText(formData.epsNominee.name);
        if (formData.epsNominee.dob) {
          const dobParts = formData.epsNominee.dob.split('-');
          if (dobParts.length === 3) {
            try {
              form.getTextField('nomineewidowDOB').setText(dobParts[2]); // Just the day (DD)
            } catch (e) {
              console.log('Could not set nomineewidowDOB - maxLength=2:', e.message);
            }
          }
        }
        if (formData.epsNominee.relationship) form.getTextField('nomineewidowrelation').setText(formData.epsNominee.relationship);
      }
      
      // Form Date and Place
      if (formData.date) form.getTextField('formDate').setText(formData.date);
      if (formData.place) form.getTextField('formPlace').setText(formData.place);
      
    } catch (fieldError) {
      console.warn('Some fields could not be filled:', fieldError.message);
    }

    // Embed signature(s) if present
    if (signatureDataUrl) {
      await embedSignatureInField(pdfDoc, form, 'signatureOfemployee_af_image', signatureDataUrl);
      await embedSignatureInField(pdfDoc, form, 'signatureOfemployer_af_image', signatureDataUrl);
    }

    const filledPdfBytes = await pdfDoc.save();
    return Buffer.from(filledPdfBytes);
  } catch (error) {
    console.error('Error filling Form 2:', error);
    throw error;
  }
}
