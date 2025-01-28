FROM node:23

WORKDIR /node-app


COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN cp .env.example .env

RUN npm run build

EXPOSE 3022

# Ponto de partida
CMD ["node", "dist/server.ts"] 