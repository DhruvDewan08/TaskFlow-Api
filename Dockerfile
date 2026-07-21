# Use an official Node.js image as the base
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Copy package files and install all dependencies (including devDeps for build)
COPY package*.json .
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript to dist/
RUN npm run build

# Expose the port
EXPOSE 5003

# Run the compiled output
CMD ["node", "dist/server.js"]


