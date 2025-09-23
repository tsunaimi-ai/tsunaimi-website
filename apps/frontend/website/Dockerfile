# Development stage
FROM node:20-alpine AS development

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies for development
RUN npm ci

# Copy source code
COPY . .

ENV NODE_ENV=development
ENV PORT=3000
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (needed for build)
RUN npm ci

# Copy source code
COPY . .

# Add ARG declarations for build arguments
ARG NEXT_PUBLIC_PLATFORM_URL

# Convert ARGs to ENVs
ENV NEXT_PUBLIC_PLATFORM_URL=${NEXT_PUBLIC_PLATFORM_URL}

# Build the application
RUN npm run build

# Production stage - ultra-optimized for size
FROM node:20-alpine AS production

# Install only essential packages
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Copy only the built Next.js application (standalone mode)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV FRONTEND_PORT_INTERNAL=3000
EXPOSE ${FRONTEND_PORT_INTERNAL}

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]