#!/bin/bash
# generate-ssl.sh
mkdir -p ssl

# Generar certificado autofirmado
openssl req -x509 -newkey rsa:2048 -keyout ssl/server.key -out ssl/server.crt \
  -days 365 -nodes -subj "/CN=localhost/O=Test/C=CO"

echo "✅ Certificados SSL generados en ./ssl/"