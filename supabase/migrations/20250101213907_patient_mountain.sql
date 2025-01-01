/*
  # Création de la table des profils utilisateurs
  
  1. Nouvelle Table
    - `profiles`
      - `id` (uuid, clé primaire, lié à auth.users)
      - `username` (text, unique, non null)
      - `created_at` (timestamp avec timezone)
      - `updated_at` (timestamp avec timezone)
  
  2. Sécurité
    - Activation RLS sur la table `profiles`
    - Politique de lecture pour les utilisateurs authentifiés
    - Politique de mise à jour pour l'utilisateur propriétaire
*/

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les profils sont visibles par les utilisateurs authentifiés"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();