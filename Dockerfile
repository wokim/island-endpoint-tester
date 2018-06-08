FROM node:8-slim

WORKDIR /app
COPY package.json /app/
COPY .gitignore /app/
RUN npm i
COPY spec /app/spec
COPY src /app/src
COPY tsconfig.json /app/
RUN npm run build
