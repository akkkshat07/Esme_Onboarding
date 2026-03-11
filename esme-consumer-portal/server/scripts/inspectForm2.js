/* eslint-disable no-console */
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function inspectForm2() {
    try {
        const formPath = path.join(__dirname, '../../public/forms/PF_Nomination_Form_1.pdf');
        const pdfBytes = fs.readFileSync(formPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);

        const pages = pdfDoc.getPages();
        console.log(`📄 Form has ${pages.length} pages`);

        pages.forEach((page, index) => {
            const { width, height } = page.getSize();
            console.log(`Page ${index}: ${width}x${height}`);
        });

        const form = pdfDoc.getForm();
        const fields = form.getFields();

        console.log('📝 Fields found:', fields.length);

        fields.forEach(field => {
            const type = field.constructor.name;
            const name = field.getName();
            // console.log(`- ${name} (${type})`);

            try {
                const widgets = field.acroField.getWidgets();
                widgets.forEach((w, i) => {
                    const rect = w.getRectangle();
                    console.log(`- ${name} (${type}) W${i}: x=${Math.round(rect.x)}, y=${Math.round(rect.y)}, w=${Math.round(rect.width)}, h=${Math.round(rect.height)}`);
                });
            } catch (e) {
                console.log(`- ${name} (${type}) (No widgets/rect)`);
            }
        });

    } catch (error) {
        console.error('Error inspecting form:', error);
    }
}

inspectForm2();
