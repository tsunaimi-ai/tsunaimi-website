# Build stage
FROM node:20-alpine AS builder

# Add ARG declarations for build arguments
ARG NEXT_PUBLIC_SHOW_LOGIN
ARG NEXT_PUBLIC_SHOW_REGISTRATION

# Convert ARGs to ENVs
ENV NEXT_PUBLIC_SHOW_LOGIN=${NEXT_PUBLIC_SHOW_LOGIN}
ENV NEXT_PUBLIC_SHOW_REGISTRATION=${NEXT_PUBLIC_SHOW_REGISTRATION}

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy over built assets and only prod deps
# 1) Build assets
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src

# 2) Runtime dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
# Install only the "dependencies", so `next`, `react`, `react-dom` etc.
RUN npm ci --omit=dev

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV FRONTEND_PORT_INTERNAL=3000
EXPOSE ${FRONTEND_PORT_INTERNAL}

# Start the application
CMD ["npm", "run", "start"]