FROM spearheadea/tsnode:6.9.1-slim-2.3.4

WORKDIR /app
COPY package.json /app/
COPY .gitignore /app/
RUN npm i
COPY spec /app/spec
COPY src /app/src
COPY tsconfig.json /app/
RUN npm run build
