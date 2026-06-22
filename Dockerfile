FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./backend/
RUN npm --prefix backend ci --omit=dev

COPY backend ./backend

EXPOSE 3001

CMD ["npm", "--prefix", "backend", "start"]
