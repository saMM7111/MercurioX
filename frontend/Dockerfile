# Build React/Vite frontend
FROM node:20-alpine AS build
WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Serve static assets + reverse-proxy /api to the gateway
FROM nginx:1.27-alpine

RUN apk add --no-cache gettext

COPY --from=build /app/dist /usr/share/nginx/html
COPY frontend/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY frontend/nginx/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PORT=3000
ENV GATEWAY_URL=http://gateway.railway.internal:8080

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
