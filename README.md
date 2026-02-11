# ESME Onboarding Portal

A comprehensive employee onboarding portal with document management, verification, and admin dashboard.

## Features

✨ **Frontend**
- Modern React 18 UI with Tailwind CSS
- Smooth animations and transitions
- Form validation and document uploads
- Real-time form status tracking
- PDF generation for checklists and forms

🔧 **Backend**
- Express.js REST API
- MongoDB database
- JWT authentication
- Google Drive integration via Service Account (NO browser login required!)
- Role-based access control (Candidate, Admin, Super Admin)

📊 **Admin Features**
- Candidate management dashboard
- Document verification
- Status tracking and updates
- Bulk operations
- Google Sheets integration
- BGV (Background Verification) tracking
- Export to Excel

🔒 **Security**
- Service Account authentication (no OAuth required)
- JWT-based session management
- Role-based access control
- Secure file uploads with validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Google Cloud Project with Service Account (for Drive integration)

### Development Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/Esme_Onboarding.git
   cd Esme_Onboarding/esme-consumer-portal
   ```

2. **Install Dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd server
   npm install
   ```

3. **Configure Environment**
   
   Create `server/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/esme_onboarding
   PORT=3000
   
   # Google Service Account (NO LOGIN REQUIRED)
   GOOGLE_PROJECT_ID=your-project-id
   GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_DRIVE_FOLDER_ID=your-folder-id
   ```
   
   See `server/.env.example` for full configuration.

4. **Setup Google Drive Service Account**
   
   Use the helper script:
   ```bash
   ./setup-service-account.sh /path/to/service-account.json
   ```
   
   Or manually follow [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md#step-1-google-cloud-service-account-setup)

5. **Run Development Servers**
   ```bash
   # Terminal 1 - Backend (from server/ directory)
   node index.js
   
   # Terminal 2 - Frontend (from esme-consumer-portal/ directory)
   npm run dev
   ```

6. **Access Application**
   - Frontend: http://localhost:5174
   - Backend: http://localhost:3000
   - Check Drive status: http://localhost:3000/api/auth/google/status

### Production Deployment (Ubuntu Server)

For complete Ubuntu server deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

**Key Points:**
- ✅ **NO browser login required** - Service Account handles everything
- ✅ **Multiple HRs** can use different devices with their credentials
- ✅ **Secure** - All files stored in your Google Drive
- ✅ **Production-ready** - PM2, Nginx, SSL included

Quick deploy:
```bash
# Follow DEPLOYMENT_GUIDE.md for step-by-step instructions
# Or use automated script (coming soon)
```

## Tech Stack

- **Frontend**: React 18.2.0, Vite 5.4.21, Tailwind CSS, Framer Motion
- **Backend**: Express.js, MongoDB, Mongoose
- **Storage**: Google Drive (Service Account)
- **PDF Generation**: PDFKit, jsPDF
- **DevOps**: PM2, Nginx, Let's Encrypt

## 📁 Project Structure

```
Esme_Onboarding/
├── esme-consumer-portal/
│   ├── src/                    # Frontend source
│   │   ├── components/         # React components
│   │   │   ├── admin/         # Admin dashboard
│   │   │   ├── candidate/     # Candidate portal
│   │   │   ├── forms/         # Onboarding forms
│   │   │   └── shared/        # Shared components
│   │   ├── utils/             # PDF generators
│   │   └── contexts/          # React contexts
│   ├── server/                # Backend
│   │   ├── models/            # MongoDB models
│   │   ├── services/          # Business logic
│   │   │   ├── googleDrive.js        # Service Account (ACTIVE)
│   │   │   ├── googleDriveOAuth.js   # OAuth (Deprecated)
│   │   │   ├── googleSheets.js
│   │   │   └── generateAndUploadPdfs.js
│   │   ├── index.js           # Express server
│   │   └── .env.example       # Environment template
│   └── public/                # Static assets
├── DEPLOYMENT_GUIDE.md        # Complete deployment guide
├── setup-service-account.sh   # Setup helper script
└── README.md                  # This file
```

## 🔐 Authentication Setup

### For Deployment (Production)

This project uses **Google Service Account** authentication for Drive access:

**Benefits:**
- ✅ No browser login required
- ✅ Works in headless environments (Ubuntu server)
- ✅ Multiple users can access without individual Google auth
- ✅ More secure and reliable

**Setup Steps:**
1. Create Google Cloud Service Account
2. Download JSON key file
3. Extract credentials using `./setup-service-account.sh`
4. Share Drive folder with service account email
5. Add credentials to `.env`

**No additional login required!** All HRs login with their ESME credentials only.

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## Setup

1. **Prerequisites**
   - Node.js v16+
   - npm v7+
   - MongoDB (local or Atlas)

2. **Development Installation**
   ```bash
   cd esme-consumer-portal
   npm install
   cd server
   npm install
   ```

3. **Environment Configuration**
   Create `.env` in `server/`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/esme_onboarding
   PORT=3000
   NODE_ENV=development
   ```

4. **Run Development**
   ```bash
   # Terminal 1: Backend
   cd esme-consumer-portal/server && npm start
   
   # Terminal 2: Frontend
   cd esme-consumer-portal && npm run dev
   ```

5. **Access Application**
   - Frontend: http://localhost:5174
   - API: http://localhost:3000/api

## Production Deployment

For detailed deployment instructions, see `DEPLOYMENT_GUIDE.md`

### Quick Deploy (Ubuntu)
```bash
sudo bash deploy.sh
```

### Default Admin
- Email: xxxxxxxx
- Password: xxxxxxx
   - Place `credentials.json` in the `server/` directory.
   - Create a `.env` file in `server/` with:
     - `PORT`
     - `MONGODB_URI`
     - `GOOGLE_PROJECT_ID`
     - `GOOGLE_CLIENT_EMAIL`
     - `GOOGLE_PRIVATE_KEY`
     - `Google Sheet IDs`

4. **Running the Application**
   - Backend:
     ```bash
     cd esme-consumer-portal/server
     npm run dev
     ```
   - Frontend:
     ```bash
     cd esme-consumer-portal
     npm run dev
     ```

## Deployment

The application handles PDF generation on the backend to ensure secure and accurate document creation with digital signatures.
