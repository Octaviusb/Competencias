FROM node:18-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy backend files
COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ ./

# Create database directory and set permissions
RUN mkdir -p prisma && chmod 755 prisma

# Set DATABASE_URL for build
ENV DATABASE_URL="file:./prisma/dev.db"

# Generate Prisma client
RUN npx prisma generate

# Initialize database
RUN npx prisma db push

EXPOSE 8080

CMD ["npm", "start"]