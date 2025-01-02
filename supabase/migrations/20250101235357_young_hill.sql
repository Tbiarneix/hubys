/*
  # Ajout des tables pour les relations familiales

  1. Nouvelles Tables
    - `couples`
      - `id` (uuid, primary key)
      - `user1_id` (référence vers profiles)
      - `user2_id` (référence vers profiles)
      - `status` (enum: en_attente, accepté)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `children`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `birth_date` (date)
      - `couple_id` (référence vers couples)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - RLS activé sur les deux tables
    - Politiques pour que seuls les utilisateurs concernés puissent voir et gérer leurs données
*/

-- Création du type enum pour le statut de la relation
CREATE TYPE couple_status AS ENUM ('en_attente', 'accepte');

-- Table des couples
CREATE TABLE couples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status couple_status DEFAULT 'en_attente',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id != user2_id)
);

-- Table des enfants
CREATE TABLE children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  birth_date date NOT NULL,
  couple_id uuid REFERENCES couples(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activation RLS
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Trigger pour updated_at sur couples
CREATE TRIGGER update_couples_updated_at
  BEFORE UPDATE ON couples
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger pour updated_at sur children
CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Politiques pour couples
CREATE POLICY "Les utilisateurs peuvent voir leurs relations"
  ON couples
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user1_id OR 
    auth.uid() = user2_id
  );

CREATE POLICY "Les utilisateurs peuvent créer des relations"
  ON couples
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user1_id AND
    status = 'en_attente'
  );

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs relations"
  ON couples
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user1_id OR 
    auth.uid() = user2_id
  )
  WITH CHECK (
    CASE
      WHEN auth.uid() = user2_id THEN
        status = 'accepte' -- Le user2 ne peut que accepter la relation
      ELSE
        true -- Le user1 peut tout modifier
    END
  );

-- Politiques pour children
CREATE POLICY "Les parents peuvent voir leurs enfants"
  ON children
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE id = children.couple_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
      AND status = 'accepte'
    )
  );

CREATE POLICY "Les parents peuvent gérer leurs enfants"
  ON children
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM couples
      WHERE id = children.couple_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
      AND status = 'accepte'
    )
  );