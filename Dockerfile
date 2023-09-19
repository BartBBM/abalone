# docker build -t abalone .
# docker run -p 3000:80 abalone

# Use an official Node.js runtime as the base image
FROM node:20-slim AS build
WORKDIR /app

# Copy package.json and package-lock.json into the directory
COPY package.json .

# Install the app dependencies
# RUN npm ci --omit dev
RUN npm install

# Bundle the app source inside the Docker image
COPY postcss.config.cjs postcss.config.cjs
COPY svelte.config.js svelte.config.js
COPY tailwind.config.cjs tailwind.config.cjs
COPY tsconfig.json tsconfig.json
COPY vite.config.ts vite.config.ts

COPY static static
COPY src src

RUN npm run build


FROM node:20-alpine
WORKDIR /app

# Copy only the built artifacts from the previous stage 
COPY --from=build /app/build build
COPY --from=build /app/package*.json .
COPY abalone.sqlite .

RUN npm ci --omit dev

EXPOSE 3000

# Define the command to run the app
CMD [ "node", "build" ]