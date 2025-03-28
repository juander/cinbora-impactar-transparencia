# ----------------------
# STAGE 1: Backend build
# ----------------------
FROM node:18-alpine AS backend-builder

WORKDIR /build

# Copy backend files needed for dependencies
COPY backend/package*.json backend/tsconfig.json backend/module-alias.js ./
COPY backend/prisma ./prisma/

# Install dependencies and build tools
RUN npm ci --prefer-offline && \
    apk add --no-cache --virtual .build-deps openssl

# Copy backend source code
COPY backend/src ./src

# Generate Prisma client and build
RUN npm run prisma:generate && \
    npx tsc --skipLibCheck && \
    npm prune --production

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
COPY frontend/ .

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
RUN npm install -g pm2 mongodb-client && \
    apk add --no-cache mongodb-tools bash

# Copy backend from builder
WORKDIR /app/backend
COPY --from=backend-builder /build/dist ./dist
COPY --from=backend-builder /build/node_modules ./node_modules
COPY --from=backend-builder /build/package.json ./
COPY --from=backend-builder /build/module-alias.js ./
COPY --from=backend-builder /build/tsconfig.json ./tsconfig.json
COPY --from=backend-builder /build/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=backend-builder /build/node_modules/.prisma ./node_modules/.prisma

# Now install mongodb after the directory exists
RUN npm install mongodb

# Add check-mongo script
COPY backend/check-mongo.js ./check-mongo.js

# Add start script
COPY backend/start.sh ./start.sh
RUN chmod +x ./start.sh

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