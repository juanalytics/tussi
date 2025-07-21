# Production-Ready Frontend Docker & Cloud Build Pipeline

## Overview
This document summarizes the new, production-grade pipeline for building and deploying the frontend service. It covers:
- Multi-stage Dockerfile for optimized production images
- Kaniko-based builds with layer caching
- Secure injection of public URLs via build arguments
- Expected workflow and best practices

---

## 1. Multi-Stage Dockerfile
- **Builder Stage:**
  - Installs all dependencies (including devDependencies) with pnpm
  - Injects public URLs via `ARG`/`ENV`
  - Runs `pnpm build` to produce optimized Next.js output
- **Production Stage:**
  - Installs only production dependencies
  - Copies only the compiled output (`.next/`, `public/`, config) from the builder
  - Results in a smaller, more secure, and faster image

**Key snippet:**
```dockerfile
# --- Builder Stage ---
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
ARG NEXT_PUBLIC_AUTH_API_URL
ARG NEXT_PUBLIC_PRODUCTS_API_URL
ARG NEXT_PUBLIC_CART_API_URL
ENV NEXT_PUBLIC_AUTH_API_URL=$NEXT_PUBLIC_AUTH_API_URL
ENV NEXT_PUBLIC_PRODUCTS_API_URL=$NEXT_PUBLIC_PRODUCTS_API_URL
ENV NEXT_PUBLIC_CART_API_URL=$NEXT_PUBLIC_CART_API_URL
RUN pnpm build

# --- Production Stage ---
FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs
EXPOSE 3000
CMD ["pnpm", "run", "start"]
```

---

## 2. Kaniko & Layer Caching in Cloud Build
- **Kaniko** is used as the Docker builder in Cloud Build for the frontend.
- **Layer caching** is enabled with `--cache=true` and a persistent `/cache` volume.
- This dramatically speeds up builds by reusing unchanged layers (e.g., dependencies).

**cloudbuild.yaml snippet:**
```yaml
- name: 'gcr.io/kaniko-project/executor:latest'
  args:
    [
      '--destination=us-central1-docker.pkg.dev/tussi-466501/microservices-repo/frontend:$SHORT_SHA',
      '--cache=true',
      '--cache-dir=/cache',
      '--build-arg', 'NEXT_PUBLIC_AUTH_API_URL=https://api.example.com/auth',
      '--build-arg', 'NEXT_PUBLIC_PRODUCTS_API_URL=https://api.example.com/products',
      '--build-arg', 'NEXT_PUBLIC_CART_API_URL=https://api.example.com/cart'
    ]
  dir: 'frontend'
  volumes:
    - name: 'kaniko-cache'
      path: /cache

volumes:
  - name: 'kaniko-cache'
    path: /cache
```

---

## 3. Secure Public URL Injection
- Public API URLs are injected at build time using `--build-arg`.
- These are available to Next.js during the build and are embedded in the static assets.
- No need to commit `.env.production` or manage secrets in the repo.

---

## 4. Expected Workflow
1. **Push code to GitHub**
2. **Cloud Build triggers:**
   - Kaniko builds the frontend image using the multi-stage Dockerfile
   - Public URLs are injected via `--build-arg`
   - Layer caching speeds up builds
   - The final, production-optimized image is pushed to Artifact Registry
3. **Deploy the image to your Kubernetes cluster** (using manifests in `kubernetes/`)

---

## 5. Best Practices
- Always use multi-stage builds for production images
- Inject environment variables via `--build-arg` for security and flexibility
- Use Kaniko or similar tools for fast, cache-enabled CI/CD builds
- Never commit sensitive `.env` files to your repo

---

If you need to update public URLs, simply change the `--build-arg` values in `cloudbuild.yaml` and push.

For further automation or deployment steps, just ask! 