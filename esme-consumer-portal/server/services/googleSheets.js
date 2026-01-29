import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getAuthClient() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: SCOPES,
    });
    return await auth.getClient();
  } catch (err) {
    console.error('Google Auth Error: Please ensure credentials.json is present in the server folder.');
    return null;
  }
}

export async function appendToSheet(spreadsheetId, range, values) {
  const auth = await getAuthClient();
  if (!auth) return;

  const sheets = google.sheets({ version: 'v4', auth });
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: { values: [values] },
    });
    console.log('Successfully appended to Google Sheet');
  } catch (err) {
    console.error('Sheet Update Error:', err.message);
  }
}
