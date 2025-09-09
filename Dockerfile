# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and dependencies
COPY package.json yarn.lock ./
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set build environment variables
ENV NODE_ENV=production
ENV NITRO_PRESET=node-server

# Build the application
RUN yarn build

# Stage 3: Runtime
FROM node:20-alpine AS runtime
WORKDIR /app

# Install dumb-init and create user
RUN apk add --no-cache dumb-init && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nuxtjs

# Copy built application
COPY --from=builder --chown=nuxtjs:nodejs /app/.output ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/healthcheck.js ./healthcheck.js

# Set environment variables
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

EXPOSE 3000

# Switch to non-root user
USER nuxtjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Start the application
CMD ["dumb-init", "node", "server/index.mjs"]
