FROM node:18-alpine

WORKDIR /app

# Copie des fichiers de dépendances
COPY frontend/package*.json ./

# Installation des dépendances
RUN npm install

# Copie du code source
COPY frontend/ ./

# Construction de l'application
RUN npm run build

# Exposition du port
EXPOSE 3000

# Démarrage de l'application
CMD ["npm", "run", "start"]