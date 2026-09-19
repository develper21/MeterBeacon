FROM node:20-alpine

WORKDIR /app

# Install OpenSSL 1.1.x for Prisma
RUN apk add --no-cache openssl1.1-compat

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
