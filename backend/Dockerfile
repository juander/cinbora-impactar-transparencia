FROM node:18-alpine AS builder

WORKDIR /build

# Copy files needed for dependencies
COPY package*.json tsconfig.json module-alias.js ./

# Install dependencies including TypeScript explicitly
RUN npm ci --prefer-offline && \
    npm install -g typescript

# Copy the backend source code
COPY . ./

# List source files to verify they exist before building
RUN ls -la src/ && \
    cat src/server.ts

# Build TypeScript with explicit compiler options
RUN npx tsc --project tsconfig.json

# Debug: Show what was actually built
RUN ls -la dist/ || echo "dist directory is missing or empty" && \
    find dist -type f | sort

FROM node:18-alpine

WORKDIR /app

# Install MongoDB tools if needed
RUN apk add --no-cache mongodb-tools bash

# Copy built files and dependencies
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/package.json ./
COPY --from=builder /build/module-alias.js ./
COPY --from=builder /build/tsconfig.json ./tsconfig.json

# Explicitly install mongodb like in your original Dockerfile
RUN npm install mongodb

# Add MongoDB check script if needed
COPY check-mongo.js ./check-mongo.js

# Verify critical files exist
RUN test -f dist/src/server.js || { echo "ERROR: Required file dist/src/server.js is missing!"; exit 1; }

EXPOSE 3333

CMD ["node", "-r", "module-alias/register", "dist/src/server.js"]