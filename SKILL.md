---
name: Esme Consumer Onboarding System
description: Complete employee onboarding platform with KYC verification (Aadhaar via DigiLocker, PAN, Bank, E-Sign using Surepass API), automated form processing, BGV Google Sheets integration, and admin management dashboard
---

# Esme Consumer Onboarding System

## Key Features

- **KYC Verification Flow**: Aadhaar (DigiLocker), PAN, Bank Account, E-Sign via Surepass API
- **Employee Joining Form**: 40+ fields auto-synced to BGV Google Sheet
- **Process Sidebar**: Collapsible navigation with completion tracking
- **BGV Integration**: Automatic data sync to OnGrid verification sheet
- **Admin Dashboard**: Candidate management and document verification
- **Google Drive**: OAuth integration for document storage
- **MongoDB**: User data and form submissions

## Tech Stack

**Backend**: Node.js, Express, MongoDB, Google APIs, Surepass API
**Frontend**: React, Vite, Tailwind CSS, Lucide Icons
**Services**: Google Sheets, Google Drive, Surepass DigiBoost SDK

## Project Structure

- `esme-consumer-portal/server/` - Backend API
- `esme-consumer-portal/src/` - React frontend
- `esme-consumer-portal/src/components/verification/` - KYC components
- `esme-consumer-portal/src/components/forms/` - Form components
- `esme-consumer-portal/server/routes/` - API routes
- `esme-consumer-portal/server/services/` - Integration services
