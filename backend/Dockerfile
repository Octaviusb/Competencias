FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create data directory for SQLite
RUN mkdir -p /data

# Set database path to persistent volume
ENV DATABASE_URL="file:/data/prod.db"

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]

EXPOSE 8080