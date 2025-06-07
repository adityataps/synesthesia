#!/bin/bash

# Script to generate .env file from environment variables
# For client service

# Check if .env file already exists
if [ -f .env ]; then
  echo ".env file already exists, skipping generation."
else
  echo "Generating .env file for client service..."

  # Set VITE_API_URL from environment variable or use default
  if [ -n "$VITE_API_URL" ]; then
    echo "VITE_API_URL=$VITE_API_URL" > .env
    echo "Using provided VITE_API_URL: $VITE_API_URL"
  else
    # Default to web service in Docker network
    echo "VITE_API_URL=http://color-picker-web:3000" > .env
    echo "Using default VITE_API_URL: http://color-picker-web:3000"
  fi

  echo ".env file generated successfully."
fi
