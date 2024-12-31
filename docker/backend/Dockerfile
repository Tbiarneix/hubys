FROM node:18-alpine

WORKDIR /app

# Copie des fichiers de dépendances
COPY backend/package*.json ./

# Installation des dépendances
RUN npm install

# Copie du schema Prisma séparément
COPY backend/prisma/schema.prisma ./prisma/

# Génération du client Prisma
RUN npx prisma generate

# Copie du reste du code source
COPY backend/ ./

# Exposition du port
EXPOSE 4000

# Démarrage de l'application
CMD ["npm", "run", "dev"]