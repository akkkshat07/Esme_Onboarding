# ESME Onboarding Portal

A comprehensive employee onboarding portal with document management, verification, and admin dashboard.

## Features

✨ **Frontend**
- Modern React 18 UI with Tailwind CSS
- Dark mode enforced globally
- Vanta.js Birds animated background
- Smooth animations with Framer Motion
- Form validation and document uploads
- Real-time form status tracking
- PDF generation for checklists and forms

🔧 **Backend**
- Express.js REST API
- MongoDB database
- JWT authentication
- Google Drive integration (optional)
- Email verification with MSG91 OTP
- Aadhaar verification support
- Role-based access control (Candidate, Admin, Super Admin)

📊 **Admin Features**
- Candidate management dashboard
- Document verification
- Status tracking and updates
- Bulk operations
- Google Sheets integration
- BGV (Background Verification) tracking

## Quick Start

### Development
```bash
cd esme-consumer-portal
npm install
npm run dev
```

### Production (Ubuntu Server)
```bash
sudo bash deploy.sh
```

## Tech Stack

- **Frontend**: React 18.2.0, Vite 5.4.21, Tailwind CSS, Framer Motion
- **Backend**: Express.js, MongoDB, Mongoose
- **DevOps**: PM2, Nginx, Let's Encrypt

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
