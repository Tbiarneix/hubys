/*
  # Support des listes multiples

  1. Nouvelle table
    - `wishlists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `title` (text)
      - `comment` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Modifications
    - Ajout de `wishlist_id` aux tables existantes
    - Mise à jour des politiques de sécurité
*/

-- Création de la table des listes
CREATE TABLE wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  title text NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ajout de la référence aux tables existantes
ALTER TABLE wishlist_categories
ADD COLUMN wishlist_id uuid REFERENCES wishlists(id) ON DELETE CASCADE;

ALTER TABLE wishlist_items
ADD COLUMN wishlist_id uuid REFERENCES wishlists(id) ON DELETE CASCADE;

-- Activation RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Trigger pour updated_at
CREATE TRIGGER update_wishlists_updated_at
  BEFORE UPDATE ON wishlists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Politiques pour les listes
CREATE POLICY "Les utilisateurs peuvent voir leurs listes"
  ON wishlists
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Les utilisateurs peuvent gérer leurs listes"
  ON wishlists
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Mise à jour des politiques existantes pour les catégories
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les catégories" ON wishlist_categories;
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs catégories" ON wishlist_categories;

CREATE POLICY "Les utilisateurs peuvent voir les catégories"
  ON wishlist_categories
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_categories.wishlist_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Les utilisateurs peuvent gérer leurs catégories"
  ON wishlist_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_categories.wishlist_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_categories.wishlist_id
      AND user_id = auth.uid()
    )
  );

-- Mise à jour des politiques existantes pour les items
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les items" ON wishlist_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs items" ON wishlist_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs propres items" ON wishlist_items;

CREATE POLICY "Les utilisateurs peuvent voir les items"
  ON wishlist_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_items.wishlist_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Les utilisateurs peuvent gérer leurs items"
  ON wishlist_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_items.wishlist_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wishlists
      WHERE id = wishlist_items.wishlist_id
      AND user_id = auth.uid()
    )
  );