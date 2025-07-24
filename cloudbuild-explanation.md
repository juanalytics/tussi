# cloudbuild.yaml & Dockerfile Optimization Explanation

## What was improved?

### 1. Dockerfile Layer Caching
- All Node.js-based Dockerfiles (`api-gateway`, `cart-api`, `frontend`) now:
  - Copy only lockfiles (`package*.json` or `pnpm-lock.yaml`) first
  - Run dependency install (`npm ci` or `pnpm install`) before copying the rest of the source code
- This allows Docker to cache the dependency install layer, so future builds are much faster if dependencies haven't changed.

### 2. .dockerignore Improvements
- All relevant services now have a `.dockerignore` that excludes:
  - `node_modules`, `.git`, `.gitignore`, `docker-compose.yml`, `tests`, `docs`, `*.md`, `.env`
- This reduces the build context size, making builds faster and images smaller.

### 3. Frontend Uses pnpm
- The frontend Dockerfile now installs dependencies using `pnpm` (matching the lockfile in the repo), ensuring consistent and fast installs.

## How to Use
- Just push your changes as usual. Cloud Build will now take advantage of Docker layer caching for dependencies, making builds faster after the first run.
- If you add or change dependencies, only that layer will be rebuilt; otherwise, Docker will reuse the cached layer.

## Why is this important?
- **Faster builds**: Only the code layer is rebuilt on most changes, not the dependencies.
- **Smaller images**: Unnecessary files are excluded from the build context.
- **Consistency**: Dependency installs are always based on the lockfile, reducing "works on my machine" issues.

---
If you need further optimizations or want to add multi-stage builds, let me know! 