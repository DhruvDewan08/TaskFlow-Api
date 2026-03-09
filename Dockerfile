# Use an official node.js image as the parent image
From node:22-alpine

# setting the working directory in the container
WORKDIR /app

# install openssl for prisma
RUN apk add --no-cache openssl

# Copy the package.json and package-lock.json files to the container
COPY package*.json .

# install the dependencies
RUN npm install

# copy the rest of the application code 
COPY . . 

# generate the Prisma client
RUN npx prisma generate

#expose the port that the app runs on 
EXPOSE 5003

#define the command to run our application 
CMD ["node", "./src/server.js"]


