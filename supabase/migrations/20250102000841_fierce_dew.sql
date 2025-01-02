/*
  # Support des items sans catégorie
  
  1. Modifications
    - Rend la colonne category_id nullable dans la table wishlist_items
    - Met à jour les politiques pour permettre les items sans catégorie
  
  2. Sécurité
    - Ajoute une politique pour les items sans catégorie
*/

-- Rendre category_id nullable
ALTER TABLE wishlist_items
ALTER COLUMN category_id DROP NOT NULL;

-- Mettre à jour la politique existante pour les items
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs items" ON wishlist_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs items" ON wishlist_items;

-- Ajouter une colonne user_id pour les items sans catégorie
ALTER TABLE wishlist_items
ADD COLUMN user_id uuid REFERENCES auth.users ON DELETE CASCADE;

-- Mettre à jour les items existants
UPDATE wishlist_items
SET user_id = (
  SELECT user_id 
  FROM wishlist_categories 
  WHERE wishlist_categories.id = wishlist_items.category_id
);

-- Rendre user_id NOT NULL
ALTER TABLE wishlist_items
ALTER COLUMN user_id SET NOT NULL;

-- Nouvelles politiques
CREATE POLICY "Les utilisateurs peuvent voir leurs items"
  ON wishlist_items
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    (category_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM wishlist_categories
      WHERE id = wishlist_items.category_id
      AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Les utilisateurs peuvent gérer leurs items"
  ON wishlist_items
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    (category_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM wishlist_categories
      WHERE id = wishlist_items.category_id
      AND user_id = auth.uid()
    ))
  );