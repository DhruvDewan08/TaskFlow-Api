# Use an official Node.js image as the base
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json .
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 5003

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
