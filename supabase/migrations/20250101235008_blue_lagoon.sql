/*
  # Ajout des champs profil

  1. Modifications
    - Ajout des colonnes à la table `profiles`:
      - `avatar_url` (text, nullable)
      - `birth_date` (date, nullable)
      - `bio` (text, nullable)

  2. Sécurité
    - Les politiques existantes couvrent déjà l'accès à ces nouveaux champs
*/

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS bio text;