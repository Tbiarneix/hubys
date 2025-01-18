# Hubilys

Application de gestion familiale construite avec Next.js, GraphQL, Prisma et PostgreSQL.

## Prérequis

- Node.js (v20 ou supérieur)
- Docker et Docker Compose
- npm ou yarn

## Installation

1. Cloner le repository :
```bash
git clone <repository-url>
cd Hubilys
```

2. Installer les dépendances :
```bash
npm install
```

3. Configuration de l'environnement :
Créer un fichier `.env` à la racine du projet avec les variables suivantes :
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/Hubilys"
JWT_SECRET="votre_secret_jwt"
NEXTAUTH_URL="http://localhost:3000"
```

## Lancement du projet

1. Démarrer les conteneurs Docker :
```bash
docker-compose up -d
```

2. Appliquer les migrations Prisma :
```bash
npx prisma migrate dev
```

3. Appliquer le seed Prisma si besoin (normalement pas besoin) :
```bash
npx prisma db seed
```
(Pour reset la bdd :
```bash
npx prisma migrate reset --force
```
)

4. Lancer l'application en mode développement :
```bash
npm run dev
```

L'application sera accessible à :
- http://localhost:3000 (local)
- http://[votre-ip]:3000 (réseau)

## Structure du projet

```
Hubilys/
├── src/
│   ├── app/              # Routes et composants Next.js
│   ├── graphql/
│   │   ├── context/      # Context GraphQL
│   │   ├── resolvers/    # Résolveurs GraphQL
│   │   ├── schemas/      # Schémas GraphQL
│   │   └── types/        # Types GraphQL
│   └── lib/              # Utilitaires et fonctions partagées
├── prisma/
│   └── schema.prisma     # Schéma de base de données
├── docker-compose.yml    # Configuration Docker
└── package.json
```

## API GraphQL

L'API GraphQL est accessible à `/api/graphql`. Elle inclut :
- Gestion des utilisateurs (CRUD)
- Authentification via JWT
- Intégration avec Prisma

## Technologies utilisées

- **Frontend** : Next.js, TailwindCSS, shadcn/ui
- **Backend** : GraphQL, Apollo Server, Prisma
- **Base de données** : PostgreSQL
- **Conteneurisation** : Docker
- **Authentification** : JWT
- **Internationalisation** : i18n

## Commandes utiles

- `npm run dev` : Lancer en mode développement
- `npm run build` : Créer une version de production
- `npm start` : Lancer en mode production
- `docker-compose up -d` : Démarrer les conteneurs
- `docker-compose down` : Arrêter les conteneurs
- `npx prisma studio` : Interface de gestion de la base de données
- `npx prisma generate` : Générer le client Prisma
- `npx prisma migrate dev` : Appliquer les migrations

## Contribution

[Instructions pour contribuer au projet]

## Licence

[Votre licence]
