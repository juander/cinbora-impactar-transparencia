FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --prefer-offline

# Copy frontend source code
COPY . ./

# Configure for standalone output
RUN if [ -f next.config.mjs ]; then \
        sed -i '/export default/i const nextConfig = {' next.config.mjs && \
        sed -i '/export default/i   output: "standalone",' next.config.mjs && \
        sed -i '/export default/i }' next.config.mjs && \
        sed -i 's/export default/export default nextConfig || /g' next.config.mjs; \
    elif [ -f next.config.js ]; then \
        sed -i 's/module.exports = {/module.exports = {\n  output: "standalone",/g' next.config.js; \
    else \
        echo 'module.exports = { output: "standalone" };' > next.config.js; \
    fi

# Set environment variables for build
ENV NEXT_PUBLIC_API_BASE_URL=/cinboratransparecer/api

# Build the Next.js app
RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Copy only necessary files from build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Set environment variables
ENV NODE_ENV=production

EXPOSE 3005

# Run the Next.js server
CMD ["node", "server.js", "--port", "3005"]