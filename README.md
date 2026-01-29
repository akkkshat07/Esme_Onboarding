# Esme Onboarding Portal

A comprehensive onboarding solution for Esme Consumer Pvt Ltd, featuring a candidate portal for submitting details and documents, and an admin dashboard for managing applications.

## Features

- **Candidate Portal**: 
  - Complete personal information forms
  - Digital signature capture
  - Document upload to Google Drive
  - Generate PDF forms automatically (Joining Form, Form F, Form 11, etc.)
  - Real-time status tracking

- **Admin Dashboard**:
  - View all candidates
  - Review submitted documents
  - Download generated PDF forms
  - Sync data to Google Sheets (BGV, Payroll, Attendance)
  - Dark mode support

## Project Structure

- `esme-consumer-portal/`: Main application folder
  - `src/`: React frontend source code
  - `server/`: Node.js/Express backend API
  
## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Integrations**: Google Drive API, Google Sheets API
- **PDF Generation**: pdf-lib

## Setup

1. **Prerequisites**
   - Node.js installed
   - MongoDB running
   - Google Cloud Service Account credentials

2. **Installation**
   ```bash
   cd esme-consumer-portal
   npm install
   cd server
   npm install
   ```

3. **Configuration**
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
