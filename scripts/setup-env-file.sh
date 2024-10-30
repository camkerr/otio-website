#! /bin/bash
set -e

# Copy the .env file from .env-sample
echo "Copying .env file from .env-sample"
cp .env-sample .env

# Print out the next steps
echo ".env file created, please add your IMS_CLIENT_ID and IMS_CLIENT_SECRET to the .env file"

# Create a new AUTH_SECRET and add it to the .env file
echo "Creating a new AUTH_SECRET and adding it to the .env file"
AUTH_SECRET=$(openssl rand -base64 32)

# Check if AUTH_SECRET already exists in the .env file
if grep -q "^AUTH_SECRET=" .env; then
    # If it exists, replace the existing line with the new AUTH_SECRET
    sed -i '' "s/^AUTH_SECRET=.*/AUTH_SECRET=$AUTH_SECRET/" .env
else
    # If it doesn't exist, append the new AUTH_SECRET to the file
    echo "AUTH_SECRET=$AUTH_SECRET" >> .env
fi
