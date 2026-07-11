# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies cleanly
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Production Stage
FROM node:18-alpine

WORKDIR /app

# Install only production dependencies for a smaller image
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled JavaScript from the builder stage
COPY --from=builder /app/dist ./dist

# Create temp uploads directory needed by the app
RUN mkdir -p uploads/temp

# Set Node environment to production
ENV NODE_ENV=production
EXPOSE 5000
