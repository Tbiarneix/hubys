FROM node:18-alpine

WORKDIR /app

# Installation des dépendances nécessaires pour Prisma
RUN apk add --no-cache openssl postgresql-client

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run prisma:generate

EXPOSE 3000

# On ne lance plus directement la commande dev
CMD ["sh", "-c", "npm run dev"]