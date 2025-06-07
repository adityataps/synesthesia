FROM node:20-slim
LABEL authors="adi"

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy scripts directory first for env setup
COPY scripts/ ./scripts/

# Copy source code
COPY . .

# Make the generate_env script executable
RUN chmod +x ./scripts/generate_env.sh

# Build TypeScript
RUN npm run build

# Expose the API port (typical for Express apps)
EXPOSE 5173 4173

# Generate .env file and start the application
CMD ["/bin/bash", "-c", "./scripts/generate_env.sh && npm run dev"]
