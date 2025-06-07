#!/bin/bash

# Script to generate .env file from environment variables
# For web service

# Check if .env file already exists
if [ -f .env ]; then
  echo ".env file already exists, skipping generation."
else
  echo "Generating .env file for web service..."

  # Express configuration
  EXPRESS_HOST=${EXPRESS_HOST:-"0.0.0.0"}
  EXPRESS_PORT=${EXPRESS_PORT:-"3000"}

  # AWS configuration
  AWS_REGION=${AWS_REGION:-"us-east-1"}
  AWS_DDB_TABLE_NAME=${AWS_DDB_TABLE_NAME:-"synesthesia-training"}

  # Generate .env file
  cat > .env << EOL
EXPRESS_HOST=${EXPRESS_HOST}
EXPRESS_PORT=${EXPRESS_PORT}

AWS_REGION=${AWS_REGION}
AWS_DDB_TABLE_NAME=${AWS_DDB_TABLE_NAME}
EOL

# Add AWS credentials if provided
if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
  cat >> .env << EOL

export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}"
EOL

  # Add AWS session token if provided
  if [ -n "$AWS_SESSION_TOKEN" ]; then
    echo "export AWS_SESSION_TOKEN=\"${AWS_SESSION_TOKEN}\"" >> .env
  fi
fi

# Add Anthropic API key if provided
if [ -n "$ANTHROPIC_API_KEY" ]; then
  echo -e "\nANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}" >> .env
fi

  echo ".env file generated successfully."
fi
