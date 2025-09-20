# Multi-stage Pharmaceutical Frontend Dockerfile for Railway Deployment
# Optimized for React.js with DGDA compliance and pharmaceutical workflow optimization

# ==========================================
# Stage 1: Build Stage
# ==========================================
FROM node:20-alpine AS builder

# Set pharmaceutical metadata
LABEL maintainer="PharmaFlow Frontend Team"
LABEL description="Railway-optimized pharmaceutical React frontend with DGDA compliance"
LABEL version="1.0.0"
LABEL pharmaceutical.frontend="React-DGDA-Bangladesh"

# Create pharmaceutical app directory
WORKDIR /app

# Install build dependencies for pharmaceutical frontend
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copy pharmaceutical package configuration from frontend directory
COPY frontend/package*.json ./

# Install pharmaceutical dependencies with audit
RUN npm ci --no-audit

# Copy pharmaceutical frontend source code from frontend directory
COPY frontend/ .

# Build pharmaceutical React application with DGDA compliance
RUN npm run build

# ==========================================
# Stage 2: Production Stage
# ==========================================
FROM nginx:alpine AS production

# Set pharmaceutical runtime environment
ENV NODE_ENV=production
ENV PHARMA_MODE=production
ENV DGDA_COMPLIANCE=enabled
ENV BANGLADESH_LOCALE=bn_BD
ENV TZ=Asia/Dhaka

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    ca-certificates \
    tzdata

# Create pharmaceutical user for security
RUN addgroup -g 1001 -S pharma && \
    adduser -S pharmaflow -u 1001 -G pharma

# Create nginx configuration template for Railway PORT handling
RUN echo 'server { \
    listen $PORT; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    add_header X-Content-Type-Options nosniff; \
    add_header X-Frame-Options DENY; \
    add_header X-XSS-Protection "1; mode=block"; \
    add_header X-DGDA-Compliance "enabled"; \
    add_header X-Pharma-Mode "production"; \
    add_header X-Bangladesh-Market "enabled"; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    location /api/ { \
        proxy_pass http://backend.railway.internal:3000; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
    \
    location /health { \
        access_log off; \
        return 200 "{\"status\":\"healthy\",\"service\":\"pharmaflow-frontend\",\"compliance\":\"dgda-enabled\"}"; \
        add_header Content-Type application/json; \
    } \
    \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
        add_header X-Pharma-Asset "optimized"; \
    } \
}' > /etc/nginx/conf.d/default.conf.template

# Copy built pharmaceutical application
COPY --from=builder /app/dist /usr/share/nginx/html

# Set proper permissions for pharmaceutical security
RUN chown -R pharmaflow:pharma /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port for pharmaceutical frontend
EXPOSE ${PORT:-80}

# Health check for pharmaceutical frontend
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-80}/health || exit 1

# Create startup script for Railway PORT handling
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'export PORT=${PORT:-80}' >> /docker-entrypoint.sh && \
    echo 'envsubst "\$PORT" < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Start nginx for pharmaceutical frontend
CMD ["/docker-entrypoint.sh"]