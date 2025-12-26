# Stage 1: Install dependencies and build
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy only the dependency files
COPY package*.json ./

# Install all dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the Next.js app
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine AS runtime

# Set the working directory
WORKDIR /app

# Copy only the production dependencies from the builder
COPY --from=builder /app/node_modules ./node_modules

# Copy the build output and public assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Expose the application port
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]