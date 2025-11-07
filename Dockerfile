FROM node:18-alpine

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ ./

# Generate Prisma client
RUN npx prisma generate

# Create database directory
RUN mkdir -p prisma

EXPOSE 3000

CMD ["npm", "start"]