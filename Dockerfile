FROM node:22.22.2-alpine3.23 AS builder
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install --before="$(node -p 'new Date(Date.now() - 864e5).toISOString()')"; fi
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.29.4-alpine3.23 AS runner
USER root
RUN apk upgrade --no-cache
USER 101
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1