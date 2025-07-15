#!/bin/bash
set -e

CONTAINER_NAME="products-db"
DB_USER="user"
DB_NAME="products"
DUMP_FILE_INSIDE_CONTAINER="/app/products_dump.sql"

echo "Restoring database '$DB_NAME' on container '$CONTAINER_NAME'..."

docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$DUMP_FILE_INSIDE_CONTAINER"

echo "Database restore complete." 