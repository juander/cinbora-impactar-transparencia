# ----------------------
# STAGE 1: Backend build
# ----------------------
FROM node:18-alpine AS backend-builder

WORKDIR /build

# Copy backend files needed for dependencies
COPY backend/package*.json backend/tsconfig.json backend/module-alias.js ./

# Install dependencies including TypeScript explicitly
RUN npm ci --prefer-offline && \
    npm install -g typescript

# Copy the ENTIRE backend folder to ensure all necessary files are included
COPY backend/ ./

# List source files to verify they exist before building
RUN ls -la src/ && \
    cat src/server.ts

# Build TypeScript with explicit compiler options to guarantee output
RUN npx tsc --project tsconfig.json

# Debug: Show what was actually built with detailed info
RUN ls -la dist/ || echo "dist directory is missing or empty" && \
    find dist -type f | sort

# ----------------------
# STAGE 2: Frontend build
# ----------------------
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY frontend/package*.json ./

# Install ALL dependencies
RUN npm ci

# Copy frontend source code
COPY frontend/ ./

# Defina a variável de ambiente antes do build
ENV NEXT_PUBLIC_API_BASE_URL=http://localhost:3015

# Configure for standalone output
RUN if [ -f next.config.mjs ]; then \
        sed -i '/export default/i const nextConfig = {' next.config.mjs && \
        sed -i '/export default/i   output: "standalone",' next.config.mjs && \
        sed -i '/export default/i }' next.config.mjs && \
        sed -i 's/export default/export default nextConfig || /g' next.config.mjs; \
    elif [ -f next.config.js ]; then \
        sed -i 's/module.exports = {/module.exports = {\n  output: "standalone",/g' next.config.js; \
    else \
        echo 'export const output = "standalone";' > next.config.mjs; \
    fi

# Build frontend
RUN npm run build

# ----------------------
# STAGE 3: Final image
# ----------------------
FROM node:18-alpine

# Create app directory structure first
WORKDIR /app
RUN mkdir -p /app/backend /app/frontend

# Install PM2 globally and necessary tools
RUN npm install -g pm2 && \
    apk add --no-cache mongodb-tools bash

# Copy backend from builder
WORKDIR /app/backend
COPY --from=backend-builder /build/dist ./dist
COPY --from=backend-builder /build/node_modules ./node_modules
COPY --from=backend-builder /build/package.json ./
COPY --from=backend-builder /build/module-alias.js ./
COPY --from=backend-builder /build/tsconfig.json ./tsconfig.json

# Debug: Verify backend files were copied correctly
RUN ls -la dist/ && \
    find dist -type f | sort && \
    test -f dist/src/server.js || { echo "ERROR: Required file dist/src/server.js is missing!"; exit 1; }

# Now install mongodb after the directory exists
RUN npm install mongodb

# Add check-mongo script
COPY backend/check-mongo.js ./check-mongo.js

# Copy frontend from builder
WORKDIR /app/frontend
COPY --from=frontend-builder /app/.next/standalone ./
COPY --from=frontend-builder /app/.next/static ./.next/static
RUN mkdir -p public

# Create PM2 ecosystem file
WORKDIR /app
COPY ecosystem.config.js /app/

# Expose both ports
EXPOSE 3000 3333

# Start the application
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
