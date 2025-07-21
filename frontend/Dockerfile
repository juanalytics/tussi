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