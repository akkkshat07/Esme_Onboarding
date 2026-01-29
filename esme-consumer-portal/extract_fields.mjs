import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

const formsDir = '/Users/aksha/Desktop/Esme_Onboarding/Joining forms checklist & forms (1) (1) (1)';

const fillablePDFs = [
  'Form 11.pdf',
  'FORM_F .pdf', 
  'PF_Nomination_Form.pdf'
];

async function extractFields() {
  for (const pdfName of fillablePDFs) {
    console.log('\n' + '='.repeat(60));
    console.log(`PDF: ${pdfName}`);
    console.log('='.repeat(60));
    
    const pdfPath = path.join(formsDir, pdfName);
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log(`Total fields: ${fields.length}\n`);
    
    fields.forEach((field, idx) => {
      const type = field.constructor.name;
      const name = field.getName();
      console.log(`${idx + 1}. [${type}] "${name}"`);
    });
  }
}

extractFields().catch(console.error);
