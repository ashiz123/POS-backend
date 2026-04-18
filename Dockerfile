#stage 1: base
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./


#stage 2: development
FROM base AS development
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]


#stage 3: test
FROM base AS test
ENV IS_DOCKER=true
RUN npm install
COPY . .
CMD [ "npm", "test" ]

#stage 4: production
FROM base AS production
RUN npm install
COPY . .
CMD ["npm", "start"]
