#
# Multi-stage Dockerfile:
# - "dev"  : runs Vite dev server (hot reload)
# - "prod" : builds static assets and serves them via Nginx
#

FROM node:20-alpine AS base
WORKDIR /app

# Install deps separately to leverage layer caching
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

FROM base AS dev
EXPOSE 8080
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8080"]

FROM base AS build
RUN npm run build

FROM nginx:1.27 AS prod
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
