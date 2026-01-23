FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application source code
COPY backend ./backend
COPY frontend ./frontend
COPY api ./api

# Ensure data directory exists
RUN mkdir -p backend/data

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
