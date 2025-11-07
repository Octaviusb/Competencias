FROM node:18-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy backend files
COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ ./

# Generate Prisma client
RUN npx prisma generate

# Create database directory
RUN mkdir -p prisma

EXPOSE 8080

CMD ["npm", "start"]