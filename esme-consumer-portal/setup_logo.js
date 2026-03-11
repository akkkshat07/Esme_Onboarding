import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.resolve(__dirname, 'src/assets/Esme-Logo-01.png');
const outputPath = path.resolve(__dirname, 'src/constants/esmeLogoBase64.js');

console.log(`Reading logo from: ${logoPath}`);

try {
    if (!fs.existsSync(logoPath)) {
        console.error(`❌ Logo file not found at ${logoPath}`);
        process.exit(1);
    }
    const bitmap = fs.readFileSync(logoPath);
    const base64 = Buffer.from(bitmap).toString('base64');
    const content = `export const ESME_LOGO_BASE64 = 'data:image/png;base64,${base64}';\n`;
    fs.writeFileSync(outputPath, content);
    console.log(`✅ Successfully created ${outputPath}`);
} catch (e) {
    console.error('Error generating logo base64:', e);
    process.exit(1);
}
