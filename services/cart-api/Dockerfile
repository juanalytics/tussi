FROM node:18-alpine

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose API port
EXPOSE 3000

# Set NODE_ENV
ENV NODE_ENV=production

# Variables de entorno para el servicio de autenticación
ENV AUTH_SERVICE_URL=http://auth-api:3010

# Start the service
CMD ["node", "src/index.js"]