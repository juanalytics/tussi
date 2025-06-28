#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------
# Network Segmentation Test for Microservices
# ---------------------------------------------------
# This script verifies that:
# 1. Public services are accessible from the host.
# 2. Private services are NOT accessible from the host.
# 3. Private services are healthy and reachable from within Docker.
# ---------------------------------------------------

# Wait for services to start up
echo "⏳ Waiting for services to start up..."
sleep 10

# Services that should be accessible from localhost
PUBLIC_SERVICES=(
  "api-gateway|http://localhost:9000/health/simple"
  "frontend|http://localhost:3000"
)

# Services that should NOT be accessible from localhost
# We test that curl fails for these.
ISOLATED_SERVICES=(
  "auth-service (isolated)|http://localhost:8000/health"
  "products-api (isolated)|http://localhost:8001/health"
  "cart-api (isolated)|http://localhost:8002/health"
)

# Services that are on the private network
# We test their health from within the network using 'docker compose exec'.
PRIVATE_SERVICES=(
  "auth-service (internal)|docker compose exec -T api-gateway curl -sf http://auth-service:8000/health"
  "products-api (internal)|docker compose exec -T api-gateway curl -sf http://products-api:8000/health"
  "cart-api (internal)|docker compose exec -T api-gateway curl -sf http://cart-api:8000/health"
  "auth-db (internal)|docker compose exec -T auth-db pg_isready -U authuser -d auth"
  "products-db (internal)|docker compose exec -T products-db pg_isready -U user -d products"
  "carts-db (internal)|docker compose exec -T carts-db mongosh --quiet --eval \"db.adminCommand('ping')\""
)

# --------------------------
# LÓGICA DE TEST
# --------------------------
pass() { printf "✅  %-30s OK\n" "$1"; }
fail() { printf "❌  %-30s FAILED\n" "$1"; exit 1; }
info() { printf "🧪  Running network segmentation tests...\n\n"; }

info

echo "--- Verifying Public Services (from Host) ---"
for entry in "${PUBLIC_SERVICES[@]}"; do
  IFS='|' read -r NAME URL <<<"$entry"
  if curl -sf "$URL" >/dev/null 2>&1; then
    pass "$NAME"
  else
    echo "   Retrying $NAME in 5 seconds..."
    sleep 5
    curl -sf "$URL" >/dev/null && pass "$NAME" || fail "$NAME"
  fi
done

echo ""
echo "--- Verifying Service Isolation (from Host) ---"
for entry in "${ISOLATED_SERVICES[@]}"; do
  IFS='|' read -r NAME URL <<<"$entry"
  # We expect curl to fail, which indicates isolation is working.
  ! curl -sf "$URL" >/dev/null 2>&1 && pass "$NAME" || fail "$NAME"
done

echo ""
echo "--- Verifying Private Services (from within Docker) ---"
for entry in "${PRIVATE_SERVICES[@]}"; do
  IFS='|' read -r NAME CMD <<<"$entry"
  if eval "$CMD" >/dev/null 2>&1; then
    pass "$NAME"
  else
    echo "   Retrying $NAME in 3 seconds..."
    sleep 3
    eval "$CMD" >/dev/null && pass "$NAME" || fail "$NAME"
  fi
done

echo ""
echo "🎉 All network segmentation tests passed!"
echo ""
echo "📊 Network Summary:"
echo "   ✓ Public services are accessible from host"
echo "   ✓ Private services are isolated from host"
echo "   ✓ Private services are healthy within Docker network"
echo "   ✓ Network segmentation is working correctly!"
