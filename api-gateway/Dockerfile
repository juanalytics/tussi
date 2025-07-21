# Dockerfile para API Gateway
FROM node:18-alpine

# Instalar curl para health checks
RUN apk add --no-cache curl

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json primero para aprovechar el cache
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el resto del código fuente
COPY . .

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S gateway -u 1001

# Cambiar propiedad de archivos
RUN chown -R gateway:nodejs /app
USER gateway

# Exponer puerto
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:9000/health || exit 1

# Comando para iniciar la aplicación
CMD ["node", "server.js"]