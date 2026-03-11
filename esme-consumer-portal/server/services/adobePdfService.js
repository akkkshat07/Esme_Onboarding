import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AdobePdfService {
  async fillForm(templatePath, formData, signatureBuffer = null, targetSignatureFields = null) {
    try {
      console.log('📝 Filling PDF:', path.basename(templatePath));


      const pdfBytes = fs.readFileSync(templatePath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();

      let filledCount = 0;

      for (const [fieldName, value] of Object.entries(formData)) {
        if (value === null || value === undefined || value === '') {
          continue;
        }

        try {
          const field = form.getTextField(fieldName);
          const text = String(value);

          const widgets = field.acroField.getWidgets();
          let fontSize = 10;

          if (widgets.length > 0) {
            const widget = widgets[0];
            const rect = widget.getRectangle();
            const fieldWidth = rect.width;
            const fieldHeight = rect.height;
            const textLength = text.length;

            if (fieldWidth < 30) {
              fontSize = 9;
            } else if (fieldWidth < 50) {
              fontSize = 10;
            } else if (fieldWidth < 80) {
              fontSize = 11;
            } else if (fieldWidth < 120) {
              if (textLength > 25) fontSize = 10;
              else if (textLength > 15) fontSize = 11;
              else fontSize = 12;
            } else {
              if (textLength > 40) fontSize = 11;
              else if (textLength > 25) fontSize = 12;
              else if (textLength > 15) fontSize = 13;
              else fontSize = 14;
            }

            if (fieldHeight < 15) {
              fontSize = Math.min(fontSize, 10);
            } else if (fieldHeight < 20) {
              fontSize = Math.min(fontSize, 12);
            }
          }

          field.setText(text);
          field.setFontSize(fontSize);
          filledCount++;
          console.log(`  ✓ ${fieldName} (${fontSize}pt)`);
        } catch (e) {
          try {
            const checkbox = form.getCheckBox(fieldName);
            if (value === true || value === 'true' || value === 'yes') {
              checkbox.check();
              filledCount++;
              console.log(`  ✓ ${fieldName} = ☑`);
            }
          } catch (e2) {
          }
        }
      }

      console.log(`📊 Filled ${filledCount} fields`);

      let outputBytes = await pdfDoc.save();

      if (signatureBuffer) {
        outputBytes = await this.embedSignature(Buffer.from(outputBytes), signatureBuffer, targetSignatureFields);
      }

      return Buffer.from(outputBytes);
    } catch (error) {
      console.error('❌ PDF fill error:', error);
      throw error;
    }
  }

  async embedSignature(pdfBuffer, signatureBuffer, targetSignatureFields = null) {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      let signatureImage;

      try {
        signatureImage = await pdfDoc.embedPng(signatureBuffer);
      } catch (pngError) {
        console.log('⚠️ PNG embed failed, trying JPG:', pngError.message);
        try {
          signatureImage = await pdfDoc.embedJpg(signatureBuffer);
        } catch (jpgError) {
          console.error('❌ Failed to embed signature as PNG or JPG:', jpgError);
          return pdfBuffer;
        }
      }

      const form = pdfDoc.getForm();
      const fields = form.getFields();

      let signatureCount = 0;

      // Find signature/image fields
      const signatureFields = fields.filter(field => {
        const name = field.getName();

        // If specific fields are requested, only match those
        if (targetSignatureFields && Array.isArray(targetSignatureFields)) {
          return targetSignatureFields.includes(name);
        }

        // Otherwise use default heuristic
        const lowerName = name.toLowerCase();
        return lowerName.includes('signature') || lowerName.includes('sign') || lowerName.includes('_af_image');
      });

      // Special mode: Sign ALL pages at bottom left
      if (targetSignatureFields === 'ALL_PAGES') {
        console.log('✍️ Signing ALL pages at bottom left');
        const pages = pdfDoc.getPages();
        for (const page of pages) {
          try {
            page.drawImage(signatureImage, {
              x: 50,
              y: 50,
              width: 100,
              height: 40
            });
            console.log('  ✓ Signature drawn on page');
            signatureCount++;
          } catch (e) {
            console.error('  ⚠ Failed to draw on page:', e.message);
          }
        }
      } else if (signatureFields.length > 0) {
        console.log(`📝 Found ${signatureFields.length} signature fields`);

        for (const field of signatureFields) {
          // ... existing logic ...
          const fieldName = field.getName();
          try {
            // For PDFButton fields (_af_image), use setImage
            if (field.constructor.name === 'PDFButton') {
              field.setImage(signatureImage);
              signatureCount++;
              console.log(`  ✓ Signature placed in button: ${fieldName}`);
            } else {
              // For text fields, draw on the page directly
              const widgets = field.acroField.getWidgets();
              if (widgets.length > 0) {
                const widget = widgets[0];
                const rect = widget.getRectangle();

                // Find which page this widget belongs to
                const pages = pdfDoc.getPages();
                let targetPage = pages[0]; // default to first page

                for (const page of pages) {
                  const annots = page.node.Annots();
                  if (annots) {
                    const annotRefs = annots.asArray();
                    for (const ref of annotRefs) {
                      if (ref === widget.ref) {
                        targetPage = page;
                        break;
                      }
                    }
                  }
                }

                const signatureWidth = Math.min(rect.width - 4, 120);
                const signatureHeight = Math.min(rect.height - 4, 40);

                targetPage.drawImage(signatureImage, {
                  x: rect.x + 2,
                  y: rect.y + 2,
                  width: signatureWidth,
                  height: signatureHeight,
                });

                signatureCount++;
                console.log(`  ✓ Signature drawn over field: ${fieldName}`);
              }
            }
          } catch (err) {
            console.log(`  ⚠ Could not place signature in ${fieldName}:`, err.message);
          }
        }
      }

      if (signatureCount === 0 && targetSignatureFields !== 'ALL_PAGES') {
        // Fallback: place signature at bottom right of first page
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width } = firstPage.getSize();

        firstPage.drawImage(signatureImage, {
          x: width - 200,
          y: 80,
          width: 150,
          height: 50,
        });
        console.log('  ✓ Signature placed at default position (fallback)');
      }

      const savedBytes = await pdfDoc.save();
      return Buffer.from(savedBytes);
    } catch (error) {
      console.error('❌ Signature error:', error);
      return pdfBuffer;
    }
  }

  async getFormFields(pdfPath) {
    try {
      const pdfBytes = fs.readFileSync(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();
      const fields = form.getFields();

      return fields.map(field => ({
        name: field.getName(),
        type: field.constructor.name
      }));
    } catch (error) {
      console.error('❌ Error reading fields:', error);
      return [];
    }
  }
}

export default new AdobePdfService();
