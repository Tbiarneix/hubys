/*
  # Création des tables pour la liste de souhaits

  1. Nouvelles Tables
    - `wishlist_categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `user_id` (uuid, foreign key)
      - `order` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `wishlist_items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `url` (text)
      - `category_id` (uuid, foreign key)
      - `order` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
*/

-- Table des catégories
CREATE TABLE wishlist_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des items
CREATE TABLE wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text,
  category_id uuid REFERENCES wishlist_categories ON DELETE CASCADE,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activation RLS
ALTER TABLE wishlist_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Triggers pour updated_at
CREATE TRIGGER update_wishlist_categories_updated_at
  BEFORE UPDATE ON wishlist_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_wishlist_items_updated_at
  BEFORE UPDATE ON wishlist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Politiques pour les catégories
CREATE POLICY "Les utilisateurs peuvent voir leurs catégories"
  ON wishlist_categories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent gérer leurs catégories"
  ON wishlist_categories
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politiques pour les items
CREATE POLICY "Les utilisateurs peuvent voir leurs items"
  ON wishlist_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlist_categories
      WHERE id = wishlist_items.category_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Les utilisateurs peuvent gérer leurs items"
  ON wishlist_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wishlist_categories
      WHERE id = wishlist_items.category_id
      AND user_id = auth.uid()
    )
  );