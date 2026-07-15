# 1. Base image with Node.js (using debian-based for better compatibility)
FROM node:22-slim

# 2. Set working directory
WORKDIR /app

# 3. Install dependencies first for better caching
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install

# 4. Copy the rest of the app
COPY . .

# 5. NEXT_PUBLIC_* vars are inlined into the browser bundle at build time. Default
# to a RELATIVE "/api" so the browser calls the same origin it's served from — the
# ingress routes /api -> backend — which makes ONE image work in every environment
# (dev/prod/local). Override with --build-arg NEXT_PUBLIC_API_URL=<absolute-url>
# only if the frontend is served on a different origin than the API.
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# 6. Expose the dev server port
EXPOSE 3000

RUN npm run build

# 7. Start the Next.js development server
CMD ["npm", "run", "start"]