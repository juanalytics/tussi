#!/bin/bash

# This script will port-forward the products-db Postgres service and import products_dump.sql into the database.
# Usage: ./populate-products-db.sh

set -e

NAMESPACE="tussi-services"
SERVICE="products-db"
LOCAL_PORT=5433
REMOTE_PORT=5432
DB_USER="user"
DB_NAME="products"
SQL_FILE="../products_dump.sql"
CONVERTED_SQL_FILE="../products_dump-utf8.sql"

# Check if SQL file exists
if [ ! -f "$SQL_FILE" ]; then
  echo "❌ SQL file not found: $SQL_FILE"
  exit 1
fi

# Detect encoding
ENCODING=$(file -bi "$SQL_FILE" | sed 's/.*charset=//')

if [ "$ENCODING" != "utf-8" ]; then
  echo "⚠️  Converting $SQL_FILE from $ENCODING to UTF-8..."
  iconv -f "$ENCODING" -t UTF-8 "$SQL_FILE" -o "$CONVERTED_SQL_FILE"
  SQL_FILE="$CONVERTED_SQL_FILE"
fi

# Start port-forwarding in the background
kubectl port-forward svc/$SERVICE $LOCAL_PORT:$REMOTE_PORT -n $NAMESPACE &
PF_PID=$!

# Wait for port-forward to be ready
sleep 3

echo "🚀 Importing $SQL_FILE into $DB_NAME..."
PGPASSWORD="password" psql -h localhost -U $DB_USER -d $DB_NAME -p $LOCAL_PORT -f "$SQL_FILE"

# Kill the port-forward process
kill $PF_PID

echo "✅ Database populated successfully." 