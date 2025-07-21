FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the source code
COPY . .

# Expose API port
EXPOSE 3000

# Set NODE_ENV
ENV NODE_ENV=production

# Variables de entorno para el servicio de autenticación
ENV AUTH_SERVICE_URL=http://auth-api:3010

# Start the service
CMD ["node", "src/index.js"]