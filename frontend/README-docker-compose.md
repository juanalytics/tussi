# Docker Compose for Frontend: Dev & Prod

This project uses a single multi-stage Dockerfile and a `docker-compose.yml` to support both development and production workflows for the frontend.

---

## Usage

### 1. Development
- Hot-reload, full dev dependencies, local code mounting.

```sh
docker-compose -f docker-compose.yml up frontend-dev
```
- Access the app at [http://localhost:3000](http://localhost:3000)
- Changes to your local code will be reflected live.

### 2. Production
- Optimized, minimal image with only production dependencies and compiled output.

```sh
docker-compose -f docker-compose.yml up frontend-prod
```
- Access the app at [http://localhost:3000](http://localhost:3000)

---

## Environment Variables
Both services support these environment variables:
- `NEXT_PUBLIC_AUTH_API_URL`
- `NEXT_PUBLIC_PRODUCTS_API_URL`
- `NEXT_PUBLIC_CART_API_URL`

Set them in your shell or in a `.env` file (see Docker Compose docs for details).

---

## How it works
- **frontend-dev**: Uses the `builder` stage of the Dockerfile, mounts your code, and runs the Next.js dev server (`pnpm run dev`).
- **frontend-prod**: Uses the final (production) stage, runs the optimized Next.js server (`pnpm run start`).

---

If you want to add more services or customize further, just ask! 