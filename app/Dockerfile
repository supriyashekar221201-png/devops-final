# syntax=docker/dockerfile:1
# Multi-stage build for the Node.js CRUD app

# ---------- Stage 1: install dependencies ----------
FROM node:20-alpine AS deps
WORKDIR /usr/src/app

# Copy only package files first so Docker can cache the npm install layer.
# Code changes won't trigger re-install unless package.json changes.
COPY package*.json ./
RUN npm ci --omit=dev

# ---------- Stage 2: production image ----------
FROM node:20-alpine
WORKDIR /usr/src/app

# Run as a non-root user for security (node:alpine ships with one named "node")
USER node

# Copy installed dependencies from the deps stage
COPY --chown=node:node --from=deps /usr/src/app/node_modules ./node_modules

# Copy application source
COPY --chown=node:node package*.json ./
COPY --chown=node:node src ./src

# Document the port the app listens on (informational; doesn't actually publish it)
EXPOSE 3000

# Default environment — override with -e flags or compose
ENV NODE_ENV=production
ENV PORT=3000

# Start the app
CMD ["node", "src/server.js"]