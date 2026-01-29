import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');


const WHITELIST_SHEET_ID = '1pAWtwA5zUHcpjd4OvhzeV6UsXn4__Q19ZcsTVb4FknE';


const SHEET_NAMES = [
  'Pre & Onboarding adherence checklist & Tracker',
  'Hire to Onboard'
];

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

async function getAuthClient() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: SCOPES,
    });
    return await auth.getClient();
  } catch (err) {
    console.error('Google Auth Error:', err.message);
    return null;
  }
}


function normalizePhone(phone) {
  if (!phone) return '';
 
  let normalized = String(phone).replace(/\D/g, '');
  
  if (normalized.length > 10 && normalized.startsWith('91')) {
    normalized = normalized.slice(2);
  }

  if (normalized.startsWith('0')) {
    normalized = normalized.slice(1);
  }
 
  return normalized.slice(-10);
}


function normalizeEmail(email) {
  if (!email) return '';
  return String(email).toLowerCase().trim();
}


let whitelistCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; 

async function fetchWhitelistData() {
  const now = Date.now();
  

  if (whitelistCache && (now - lastFetchTime) < CACHE_DURATION) {
    return whitelistCache;
  }

  const auth = await getAuthClient();
  if (!auth) {
    console.error('❌ Failed to authenticate with Google Sheets');
    return null;
  }

  const sheets = google.sheets({ version: 'v4', auth });
  const candidates = [];

  for (const sheetName of SHEET_NAMES) {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: WHITELIST_SHEET_ID,
        range: `'${sheetName}'!A:Z`,
      });

      const rows = response.data.values || [];
      if (rows.length === 0) continue;

     
      const headers = rows[0].map(h => String(h).toLowerCase().trim());
      
      const nameIdx = headers.findIndex(h => 
        h.includes('name') && !h.includes('father') && !h.includes('mother') && !h.includes('spouse')
      );
      const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail'));
      const phoneIdx = headers.findIndex(h => 
        h.includes('phone') || h.includes('mobile') || h.includes('contact') || h.includes('number')
      );

      console.log(`📋 Sheet "${sheetName}": Found columns - Name: ${nameIdx}, Email: ${emailIdx}, Phone: ${phoneIdx}`);

 
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const name = nameIdx >= 0 ? String(row[nameIdx] || '').trim() : '';
        const email = emailIdx >= 0 ? normalizeEmail(row[emailIdx]) : '';
        const phone = phoneIdx >= 0 ? normalizePhone(row[phoneIdx]) : '';

        if (phone || email) {
          candidates.push({ name, email, phone, sheet: sheetName });
        }
      }
    } catch (err) {
      console.error(`❌ Error reading sheet "${sheetName}":`, err.message);
    }
  }

  console.log(`✅ Loaded ${candidates.length} candidates from whitelist`);
  
  whitelistCache = candidates;
  lastFetchTime = now;
  
  return candidates;
}

export async function isWhitelisted(phone, email) {
  const whitelist = await fetchWhitelistData();
  
  if (!whitelist) {
    console.log('⚠️ Whitelist not available, allowing access (fallback mode)');
    return { allowed: true, reason: 'Whitelist unavailable' };
  }

  const normalizedPhone = normalizePhone(phone);
  const normalizedEmail = normalizeEmail(email);

  console.log(`🔍 Checking whitelist for phone: ${normalizedPhone}, email: ${normalizedEmail}`);

  for (const candidate of whitelist) {
  
    if (normalizedPhone && candidate.phone && candidate.phone === normalizedPhone) {
      console.log(`✅ Phone match found: ${candidate.name} in ${candidate.sheet}`);
      return { 
        allowed: true, 
        candidate: candidate,
        matchedBy: 'phone'
      };
    }
    
  
    if (normalizedEmail && candidate.email && candidate.email === normalizedEmail) {
      console.log(`✅ Email match found: ${candidate.name} in ${candidate.sheet}`);
      return { 
        allowed: true, 
        candidate: candidate,
        matchedBy: 'email'
      };
    }
  }

  console.log(`❌ No match found in whitelist`);
  return { 
    allowed: false, 
    reason: 'Your phone number or email is not in the approved candidate list. Please contact HR.'
  };
}


export async function refreshWhitelist() {
  whitelistCache = null;
  lastFetchTime = 0;
  return await fetchWhitelistData();
}

export async function getWhitelistStats() {
  const whitelist = await fetchWhitelistData();
  if (!whitelist) return null;
  
  return {
    totalCandidates: whitelist.length,
    lastRefresh: new Date(lastFetchTime).toISOString(),
    sheets: SHEET_NAMES
  };
}
