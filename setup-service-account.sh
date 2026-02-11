#!/bin/bash

# ESME Onboarding - Service Account Setup Helper
# This script helps extract Service Account credentials from JSON file

echo "🔧 ESME Onboarding - Service Account Configuration Helper"
echo "=========================================================="
echo ""

# Check if JSON file path is provided
if [ -z "$1" ]; then
    echo "Usage: ./setup-service-account.sh /path/to/service-account.json"
    echo ""
    echo "Example:"
    echo "  ./setup-service-account.sh ~/Downloads/esme-service-account-key.json"
    exit 1
fi

JSON_FILE="$1"

# Check if file exists
if [ ! -f "$JSON_FILE" ]; then
    echo "❌ Error: File not found: $JSON_FILE"
    exit 1
fi

# Extract values from JSON
PROJECT_ID=$(cat "$JSON_FILE" | grep -o '"project_id": "[^"]*' | cut -d'"' -f4)
CLIENT_EMAIL=$(cat "$JSON_FILE" | grep -o '"client_email": "[^"]*' | cut -d'"' -f4)
PRIVATE_KEY=$(cat "$JSON_FILE" | grep -o '"private_key": "[^"]*' | sed 's/"private_key": "//' | sed 's/\\n/\\n/g')

echo "✅ Service Account credentials extracted!"
echo ""
echo "📋 Add these to your .env file:"
echo "=========================================================="
echo ""
echo "GOOGLE_PROJECT_ID=$PROJECT_ID"
echo "GOOGLE_CLIENT_EMAIL=$CLIENT_EMAIL"
echo "GOOGLE_PRIVATE_KEY=\"$PRIVATE_KEY\""
echo ""
echo "=========================================================="
echo ""
echo "📝 Next Steps:"
echo "1. Copy the above lines to your .env file"
echo "2. Add GOOGLE_DRIVE_FOLDER_ID to .env"
echo "3. Share your Google Drive folder with: $CLIENT_EMAIL"
echo "4. Test connection: curl http://localhost:3000/api/auth/google/status"
echo ""
echo "✨ Done!"
