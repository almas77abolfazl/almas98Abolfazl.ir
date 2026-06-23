FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/tsconfig*.json ./

RUN printf '#!/bin/sh\n' > /entrypoint.sh && \
    printf 'for i in 1 2 3; do\n' >> /entrypoint.sh && \
    printf '  ./node_modules/.bin/prisma db push && break\n' >> /entrypoint.sh && \
    printf '  sleep 2\n' >> /entrypoint.sh && \
    printf 'done\n' >> /entrypoint.sh && \
    printf 'exec node dist/main\n' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
