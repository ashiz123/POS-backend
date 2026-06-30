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


#stage 4: builder
FROM base AS builder
ENV NODE_OPTIONS="--max-old-space-size=1024"
COPY package*.json ./
RUN npm install
RUN npm list @swc/cli || (echo "@swc/cli NOT FOUND" && exit 1)
COPY . .
RUN npm run build



#stage 4: production
FROM base AS production
RUN npm install --omit=dev

# १. logs फोल्डर बनाउनुहोस् र त्यसको मालिक 'node' युजरलाई बनाउनुहोस्
RUN mkdir -p logs && chown -R node:node logs

#Copy the compiled /app/dist folder from the builder stage to dist folder
COPY --from=builder /app/dist ./dist
COPY package*.json ./

#Switch to non-root 'node' user for production security
USER node

#Start the compile production build
CMD ["npm", "start"]
