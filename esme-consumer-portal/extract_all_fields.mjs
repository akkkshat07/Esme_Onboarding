import { PDFDocument } from 'pdf-lib';
import { readFileSync } from 'fs';

const extractFields = async (pdfPath, formName) => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`FORM: ${formName}`);
  console.log(`${'='.repeat(80)}`);
  
  const pdfBytes = readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  
  const textFields = [];
  const checkboxFields = [];
  const buttonFields = [];
  const otherFields = [];
  
  fields.forEach(field => {
    const name = field.getName();
    const type = field.constructor.name;
    
    if (type === 'PDFTextField') {
      textFields.push(name);
    } else if (type === 'PDFCheckBox') {
      checkboxFields.push(name);
    } else if (type === 'PDFButton') {
      buttonFields.push(name);
    } else {
      otherFields.push({ name, type });
    }
  });
  
  console.log(`\n📝 TEXT FIELDS (${textFields.length}):`);
  textFields.forEach((f, i) => console.log(`  ${i+1}. ${f}`));
  
  console.log(`\n☑️ CHECKBOX FIELDS (${checkboxFields.length}):`);
  checkboxFields.forEach((f, i) => console.log(`  ${i+1}. ${f}`));
  
  console.log(`\n🖼️ BUTTON/IMAGE FIELDS (${buttonFields.length}):`);
  buttonFields.forEach((f, i) => console.log(`  ${i+1}. ${f}`));
  
  if (otherFields.length > 0) {
    console.log(`\n❓ OTHER FIELDS (${otherFields.length}):`);
    otherFields.forEach((f, i) => console.log(`  ${i+1}. ${f.name} (${f.type})`));
  }
  
  return { textFields, checkboxFields, buttonFields };
};

const main = async () => {
  await extractFields('./public/forms/Form 11.pdf', 'FORM 11 - EPF Declaration');
  await extractFields('./public/forms/FORM_F.PDF', 'FORM F - Gratuity Nomination');
  await extractFields('./public/forms/PF_Nomination_Form.pdf', 'PF NOMINATION FORM');
};

main().catch(console.error);
