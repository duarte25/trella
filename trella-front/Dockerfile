FROM node:23

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN cp .env.example .env

RUN npm run build

EXPOSE 3020

ENV PORT=3020

CMD ["npm", "start"]