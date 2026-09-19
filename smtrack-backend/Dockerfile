FROM node:20-alpine

WORKDIR /app

# Install OpenSSL and dependencies for Prisma
RUN apk add --no-cache openssl openssl-libs-static

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
