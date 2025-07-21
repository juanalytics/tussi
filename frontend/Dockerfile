# --- Development/Build Stage ---
FROM node:20-alpine AS builder

# Set build-time environment variables (if needed)
ARG NEXT_PUBLIC_AUTH_API_URL
ARG NEXT_PUBLIC_PRODUCTS_API_URL
ARG NEXT_PUBLIC_CART_API_URL

ENV NEXT_PUBLIC_AUTH_API_URL=${NEXT_PUBLIC_AUTH_API_URL}
ENV NEXT_PUBLIC_PRODUCTS_API_URL=${NEXT_PUBLIC_PRODUCTS_API_URL}
ENV NEXT_PUBLIC_CART_API_URL=${NEXT_PUBLIC_CART_API_URL}

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy lockfile and package.json first for better caching
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies)
RUN pnpm install

# Copy the rest of the source code
COPY . .

# Build the Next.js app (outputs to .next/ by default)
RUN pnpm run build

# --- Production Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy only the lockfile and package.json for prod install
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built output and necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/package.json ./package.json

# Expose the port Next.js will run on
EXPOSE 3000

# Start the Next.js app in production mode
CMD ["pnpm", "run", "start"]