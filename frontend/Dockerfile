# Node.js 18 for Vite React app
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start development server with host binding
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]