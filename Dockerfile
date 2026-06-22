FROM node:22-slim

WORKDIR /app

ENV NODE_ENV=production

COPY backend/package*.json ./backend/
RUN npm --prefix backend ci --omit=dev

COPY backend ./backend

EXPOSE 3001

CMD ["npm", "--prefix", "backend", "start"]
