const fs = require('fs');
const { execSync } = require('child_process');

try {
    // Fetch a clean PNG avatar for 'Akshat Yadav'
    console.log('Fetching avatar...');
    const b64 = execSync('curl -s -L "https://ui-avatars.com/api/?name=Akshat+Yadav&background=0D8ABC&color=fff&size=200&format=png" | base64').toString().replace(/\n/g, '');

    // Write to constant file with single line format
    const content = `export const AADHAAR_IMAGE = 'data:image/png;base64,${b64}';\n`;
    fs.writeFileSync('src/constants/aadhaarImage.js', content);

    console.log('✅ Updated src/constants/aadhaarImage.js with valid PNG data.');
} catch (e) {
    console.error('❌ Failed to fetch avatar:', e);
}
