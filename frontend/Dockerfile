# 1. Base image with Node.js (using debian-based for better compatibility)
FROM node:22-slim

# 2. Set working directory
WORKDIR /app

# 3. Install dependencies first for better caching
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install

# 5. Copy the rest of the app
COPY . .

# 6. Expose the dev server port
EXPOSE 3000

# 7. Start the Next.js development server
CMD ["npm", "run", "start"]