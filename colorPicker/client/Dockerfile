FROM node:20-slim
LABEL authors="adi"

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

## Touch .env file if not exists
#CMD ["touch", ".env"]

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose the API port (typical for Express apps)
EXPOSE 5173 4173

# Start the application
#CMD ["npm", "run", "preview"]
CMD ["npm", "run", "dev"]
