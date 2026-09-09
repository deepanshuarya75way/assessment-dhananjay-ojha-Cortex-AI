# ─────────────────────────────────────────────────────────────
# Backend deployment
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Install dependencies (production-only keeps the image small)
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Bundle app source
COPY . .

ENV NODE_ENV=production
EXPOSE 3002

# Non-root user for security
USER node

CMD ["node", "server.js"]