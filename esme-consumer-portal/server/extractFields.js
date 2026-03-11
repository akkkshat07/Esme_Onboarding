import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

async function extractFields(pdfPath) {
  try {
    const pdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log(`\n=== ${path.basename(pdfPath)} ===`);
    console.log(`Total fields: ${fields.length}\n`);
    
    fields.forEach((field, index) => {
      const name = field.getName();
      const type = field.constructor.name;
      let maxLength = 'N/A';
      
      try {
        if (type === 'PDFTextField') {
          maxLength = field.getMaxLength() || 'unlimited';
        }
      } catch (e) {}
      
      console.log(`${index + 1}. "${name}" - ${type} (maxLength: ${maxLength})`);
    });
    
  } catch (error) {
    console.error(`Error extracting fields from ${pdfPath}:`, error.message);
  }
}

// Extract fields from all 3 government forms
const forms = [
  '../public/forms/Form 11.pdf',
  '../public/forms/FORM_F.PDF',
  '../public/forms/PF_Nomination_Form.pdf'
];

for (const formPath of forms) {
  await extractFields(formPath);
}
