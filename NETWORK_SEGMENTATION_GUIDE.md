# Complete Guide: Implementing Network Segmentation with Docker Compose

This comprehensive guide explains how to implement, troubleshoot, and verify network segmentation for a microservices application using Docker Compose. You'll learn not just the "what" but the "why" and "how" behind each decision, including common pitfalls and their solutions.

## Table of Contents
1. [Why Network Segmentation?](#1-why-network-segmentation)
2. [Architecture Overview](#2-architecture-overview)
3. [Implementation Steps](#3-implementation-steps)
4. [Building the Test Script](#4-building-the-test-script)
5. [Troubleshooting Common Issues](#5-troubleshooting-common-issues)
6. [Verification and Testing](#6-verification-and-testing)

## 1. Why Network Segmentation?

In a microservices architecture, services communicate over networks. By default, Docker Compose creates a single network where all services can reach each other and are potentially accessible from the host machine. This creates several security concerns:

### Security Risks Without Segmentation:
- **Direct Database Access**: Attackers could potentially access databases directly if they compromise the host
- **Service Enumeration**: All internal services are discoverable and accessible
- **Lateral Movement**: If one service is compromised, attackers have direct access to all others
- **No Defense in Depth**: A single point of failure can compromise the entire system

### Benefits of Network Segmentation:
- **Defense in Depth**: Multiple layers of security - even if the API Gateway is compromised, internal services remain protected
- **Controlled Communication**: Explicit definition of which services can communicate with each other
- **Reduced Attack Surface**: Internal services are not exposed to the public internet
- **Compliance**: Many security frameworks require network isolation
- **Clearer Architecture**: Network topology becomes an explicit part of your infrastructure design

## 2. Architecture Overview

Our segmented architecture uses two distinct networks:

```
┌─────────────────────────────────────────────────────────────┐
│                        HOST MACHINE                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   PUBLIC NETWORK                        ││
│  │  ┌─────────────┐              ┌─────────────┐          ││
│  │  │  Frontend   │              │ API Gateway │          ││
│  │  │ (Port 3000) │              │ (Port 9000) │          ││
│  │  └─────────────┘              └─────┬───────┘          ││
│  └────────────────────────────────────────┼────────────────┘│
│                                         │                  │
│  ┌────────────────────────────────────────┼────────────────┐│
│  │                   PRIVATE NETWORK      │                ││
│  │                                        │                ││
│  │  ┌─────────────┐  ┌─────────────┐    ┌▼────────────┐   ││
│  │  │Auth Service │  │Products API │    │  Cart API   │   ││
│  │  │ (Port 8000) │  │ (Port 8000) │    │ (Port 8000) │   ││
│  │  └─────────────┘  └─────────────┘    └─────────────┘   ││
│  │                                                         ││
│  │  ┌─────────────┐  ┌─────────────┐    ┌─────────────┐   ││
│  │  │   Auth DB   │  │Products DB  │    │  Carts DB   │   ││
│  │  │ (Port 5432) │  │ (Port 5432) │    │ (Port 27017)│   ││
│  │  └─────────────┘  └─────────────┘    └─────────────┘   ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Key Points:**
- **Public Network**: Accessible from the host machine (your computer/internet)
- **Private Network**: Isolated from the host, marked as `internal: true`
- **API Gateway**: Acts as a bridge, connected to both networks
- **Frontend**: Only needs to communicate with API Gateway
- **Backend Services**: Completely isolated from external access

## 3. Implementation Steps

### Step 1: Define Networks in docker-compose.yml

Add the network definitions at the bottom of your `docker-compose.yml`:

```yaml
networks:
  public:
    driver: bridge
  private:
    driver: bridge
    internal: true  # This is the key - prevents external access
```

**Critical Detail**: The `internal: true` setting on the private network is what provides the isolation. Without this, the network would still be accessible from the host.

### Step 2: Assign Services to Networks

**Frontend (Public Only):**
```yaml
frontend:
  # ... other configuration
  networks:
    - public
```

**API Gateway (Bridge - Both Networks):**
```yaml
api-gateway:
  # ... other configuration
  networks:
    - public   # Accessible from host
    - private  # Can reach backend services
```

**Backend Services (Private Only):**
```yaml
auth-service:
  # ... other configuration
  networks:
    - private

products-api:
  # ... other configuration
  networks:
    - private

cart-api:
  # ... other configuration
  networks:
    - private
```

**Databases (Private Only):**
```yaml
auth-db:
  # ... other configuration
  networks:
    - private

products-db:
  # ... other configuration
  networks:
    - private

carts-db:
  # ... other configuration
  networks:
    - private
```

### Step 3: Ensure Health Endpoints Exist

**Critical Implementation Detail**: For testing to work, all services must have health endpoints. Here's how to add them:

**For FastAPI services (Python):**
```python
from fastapi import FastAPI
from datetime import datetime

app = FastAPI()

@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "your-service-name",
        "timestamp": datetime.now().isoformat()
    }
```

**For Express.js services (Node.js):**
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'your-service-name',
    timestamp: new Date().toISOString()
  });
});
```

### Step 4: API Gateway Health Endpoint Strategy

The API Gateway needs two types of health checks:

**Simple Health Check** (doesn't depend on backend services):
```javascript
app.get('/health/simple', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'api-gateway' });
});
```

**Comprehensive Health Check** (checks all backend services):
```javascript
app.get('/health', async (req, res) => {
  const serviceChecks = {};
  
  for (const [serviceName, serviceUrl] of Object.entries(SERVICES)) {
    try {
      const response = await axios.get(`${serviceUrl}/health`, { timeout: 3000 });
      serviceChecks[serviceName] = { status: 'UP' };
    } catch (error) {
      serviceChecks[serviceName] = { status: 'DOWN', error: error.message };
    }
  }

  const allServicesUp = Object.values(serviceChecks).every(check => check.status === 'UP');

  // Always return 200 for gateway health - it's running if it can respond
  res.status(200).json({
    gateway: 'UP',
    timestamp: new Date().toISOString(),
    services: serviceChecks,
    overall: allServicesUp ? 'HEALTHY' : 'DEGRADED'
  });
});
```

## 4. Building the Test Script

The test script is crucial for verifying that your network segmentation works correctly. Here's how to build it step by step:

### Understanding the Test Strategy

The test script validates three critical aspects:

1. **Public Accessibility**: Services that should be reachable from the host
2. **Private Isolation**: Services that should NOT be reachable from the host
3. **Internal Connectivity**: Services can communicate within the private network

### Script Structure

```bash
#!/usr/bin/env bash
set -euo pipefail

# Exit immediately if a command exits with a non-zero status
# Treat unset variables as an error
# Exit if any command in a pipeline fails
```

### Test Categories Definition

```bash
# Services that should be accessible from localhost
PUBLIC_SERVICES=(
  "api-gateway|http://localhost:9000/health/simple"
  "frontend|http://localhost:3000"
)

# Services that should NOT be accessible from localhost
ISOLATED_SERVICES=(
  "auth-service (isolated)|http://localhost:8000/health"
  "products-api (isolated)|http://localhost:8001/health"
  "cart-api (isolated)|http://localhost:8002/health"
)

# Services to test from within the Docker network
PRIVATE_SERVICES=(
  "auth-service (internal)|docker compose exec -T api-gateway curl -sf http://auth-service:8000/health"
  "products-api (internal)|docker compose exec -T api-gateway curl -sf http://products-api:8000/health"
  "cart-api (internal)|docker compose exec -T api-gateway curl -sf http://cart-api:8000/health"
  "auth-db (internal)|docker compose exec -T auth-db pg_isready -U authuser -d auth"
  "products-db (internal)|docker compose exec -T products-db pg_isready -U user -d products"
  "carts-db (internal)|docker compose exec -T carts-db mongosh --quiet --eval \"db.adminCommand('ping')\""
)
```

### Helper Functions

```bash
pass() { printf "✅  %-30s OK\n" "$1"; }
fail() { printf "❌  %-30s FAILED\n" "$1"; exit 1; }
info() { printf "🧪  Running network segmentation tests...\n\n"; }
```

### Test Implementation with Retry Logic

**Public Services Test:**
```bash
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
```

**Isolation Test (Critical Logic):**
```bash
echo "--- Verifying Service Isolation (from Host) ---"
for entry in "${ISOLATED_SERVICES[@]}"; do
  IFS='|' read -r NAME URL <<<"$entry"
  # We expect curl to fail, which indicates isolation is working
  # The '!' inverts the exit code - success becomes failure and vice versa
  ! curl -sf "$URL" >/dev/null 2>&1 && pass "$NAME" || fail "$NAME"
done
```

**Internal Connectivity Test:**
```bash
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
```

### Why Each Test Component Matters

**Startup Wait Time:**
```bash
echo "⏳ Waiting for services to start up..."
sleep 10
```
- Services need time to initialize
- Health checks may fail during startup
- 10 seconds is usually sufficient for most services

**Retry Logic:**
- Network conditions can be unstable during startup
- Retry logic makes tests more reliable
- Different retry times for different service types

**Using `docker compose exec`:**
- Tests internal connectivity from within the Docker network
- Uses the API Gateway as a "test runner" since it's connected to the private network
- The `-T` flag disables TTY allocation (important for automated scripts)

### Database-Specific Testing

**PostgreSQL:**
```bash
docker compose exec -T auth-db pg_isready -U authuser -d auth
```

**MongoDB:**
```bash
docker compose exec -T carts-db mongosh --quiet --eval "db.adminCommand('ping')"
```

These commands test database connectivity without requiring HTTP endpoints.

### Complete Test Script Template

```bash
#!/usr/bin/env bash
set -euo pipefail

# Wait for services to start
echo "⏳ Waiting for services to start up..."
sleep 10

# Define test arrays (as shown above)
# Define helper functions (as shown above)

info

# Run all three test categories
# (Implementation as shown above)

echo ""
echo "🎉 All network segmentation tests passed!"
echo ""
echo "📊 Network Summary:"
echo "   ✓ Public services are accessible from host"
echo "   ✓ Private services are isolated from host"
echo "   ✓ Private services are healthy within Docker network"
echo "   ✓ Network segmentation is working correctly!"
```

## 5. Troubleshooting Common Issues

### Issue 1: API Gateway Health Check Fails

**Symptoms:**
```
❌  api-gateway                    FAILED
```

**Possible Causes:**
1. API Gateway trying to check backend services that aren't ready
2. Missing health endpoint
3. Network connectivity issues

**Solutions:**
1. **Add a simple health endpoint** that doesn't depend on backend services:
   ```javascript
   app.get('/health/simple', (req, res) => {
     res.status(200).json({ status: 'UP', service: 'api-gateway' });
   });
   ```

2. **Modify comprehensive health check** to always return 200 for the gateway itself:
   ```javascript
   // Always return 200 for gateway health - it's running if it can respond
   res.status(200).json({
     gateway: 'UP',
     services: serviceChecks,
     overall: allServicesUp ? 'HEALTHY' : 'DEGRADED'
   });
   ```

### Issue 2: Services Return 404 for Health Endpoints

**Symptoms:**
```
INFO:     172.21.0.8:34226 - "GET /health HTTP/1.1" 404 Not Found
```

**Cause:** Service doesn't have a `/health` endpoint implemented.

**Solution:** Add health endpoints to all services (see Step 3 above).

### Issue 3: Private Services Are Accessible from Host

**Symptoms:** Isolation tests fail - services that should be blocked are accessible.

**Possible Causes:**
1. Missing `internal: true` on private network
2. Service assigned to wrong network
3. Port mapping exposing services unintentionally

**Solutions:**
1. **Verify network configuration:**
   ```yaml
   networks:
     private:
       driver: bridge
       internal: true  # This must be present
   ```

2. **Check service network assignments:**
   ```yaml
   auth-service:
     networks:
       - private  # Should only be on private network
   ```

3. **Remove unnecessary port mappings** from private services.

### Issue 4: Internal Services Can't Communicate

**Symptoms:** Internal connectivity tests fail.

**Possible Causes:**
1. Services not on the same network
2. Service discovery issues
3. Health endpoints not responding

**Solutions:**
1. **Verify all backend services are on private network**
2. **Use service names** for internal communication (not localhost)
3. **Check service logs** for startup errors

### Issue 5: Test Script Timing Issues

**Symptoms:** Intermittent test failures, especially on slower systems.

**Solutions:**
1. **Increase startup wait time:**
   ```bash
   sleep 15  # Instead of 10
   ```

2. **Add more robust retry logic:**
   ```bash
   for i in {1..3}; do
     if curl -sf "$URL" >/dev/null 2>&1; then
       pass "$NAME"
       break
     elif [ $i -eq 3 ]; then
       fail "$NAME"
     else
       echo "   Attempt $i failed, retrying..."
       sleep 5
     fi
   done
   ```

## 6. Verification and Testing

### Running the Complete Test

1. **Make the script executable:**
   ```bash
   chmod +x ./test.sh
   ```

2. **Start your services:**
   ```bash
   docker compose up -d --build
   ```

3. **Run the test:**
   ```bash
   ./test.sh
   ```

### Expected Output

```
⏳ Waiting for services to start up...
🧪  Running network segmentation tests...

--- Verifying Public Services (from Host) ---
✅  api-gateway                    OK
✅  frontend                       OK

--- Verifying Service Isolation (from Host) ---
✅  auth-service (isolated)        OK
✅  products-api (isolated)        OK
✅  cart-api (isolated)            OK

--- Verifying Private Services (from within Docker) ---
✅  auth-service (internal)        OK
✅  products-api (internal)        OK
✅  cart-api (internal)            OK
✅  auth-db (internal)             OK
✅  products-db (internal)         OK
✅  carts-db (internal)            OK

🎉 All network segmentation tests passed!

📊 Network Summary:
   ✓ Public services are accessible from host
   ✓ Private services are isolated from host
   ✓ Private services are healthy within Docker network
   ✓ Network segmentation is working correctly!
```

### Manual Verification

You can also manually verify the segmentation:

**Test public access:**
```bash
curl http://localhost:9000/health/simple  # Should work
curl http://localhost:3000                # Should work
```

**Test isolation:**
```bash
curl http://localhost:8000/health         # Should fail (connection refused)
curl http://localhost:8001/health         # Should fail (connection refused)
```

**Test internal connectivity:**
```bash
docker compose exec api-gateway curl http://auth-service:8000/health  # Should work
```

### Continuous Integration

For CI/CD pipelines, you can integrate the test script:

```yaml
# Example GitHub Actions step
- name: Test Network Segmentation
  run: |
    docker compose up -d --build
    ./test.sh
    docker compose down
```

## Conclusion

Network segmentation is a critical security practice that:

1. **Reduces attack surface** by isolating internal services
2. **Implements defense in depth** through multiple security layers
3. **Provides clear architecture boundaries** between public and private components
4. **Can be automatically verified** through comprehensive testing

The test script is essential for ensuring your segmentation works correctly and continues to work as your application evolves. By following this guide, you'll have a robust, secure, and verifiable network architecture for your microservices application. 