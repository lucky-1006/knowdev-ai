# Use an official Node runtime as a parent image
FROM node:20-alpine

# Set work directory
WORKDIR /app

# Copy package files
COPY package*.json /app/

# Install dependencies using legacy-peer-deps to avoid any React 19 / Next 16 version warning issues
RUN npm install --legacy-peer-deps

# Copy project files
COPY . /app/

# Build Next.js application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start Next.js server
CMD ["npm", "run", "start"]
