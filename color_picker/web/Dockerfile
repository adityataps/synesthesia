FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Touch .env file if not exists
CMD ["touch", ".env"]

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose the API port (typical for Express apps)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
