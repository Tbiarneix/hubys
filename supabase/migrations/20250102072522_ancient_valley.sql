/*
  # Suppression des colonnes child_id et simplification des politiques

  1. Changements
    - Suppression des politiques existantes
    - Suppression des contraintes et triggers
    - Suppression des colonnes child_id
    - Création de nouvelles politiques simplifiées
*/

-- Suppression des politiques existantes
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les items" ON wishlist_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs items" ON wishlist_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les catégories" ON wishlist_categories;
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs catégories" ON wishlist_categories;

-- Suppression des contraintes et triggers
DROP TRIGGER IF EXISTS check_wishlist_item_owner_trigger ON wishlist_items;
DROP FUNCTION IF EXISTS check_wishlist_item_owner();
ALTER TABLE wishlist_items DROP CONSTRAINT IF EXISTS wishlist_items_owner_check;
ALTER TABLE wishlist_categories DROP CONSTRAINT IF EXISTS wishlist_categories_owner_check;

-- Suppression des colonnes child_id
ALTER TABLE wishlist_items DROP COLUMN IF EXISTS child_id;
ALTER TABLE wishlist_categories DROP COLUMN IF EXISTS child_id;

-- Création des nouvelles politiques pour les items
CREATE POLICY "Les utilisateurs peuvent voir les items"
  ON wishlist_items
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Les utilisateurs peuvent gérer leurs items"
  ON wishlist_items
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Création des nouvelles politiques pour les catégories
CREATE POLICY "Les utilisateurs peuvent voir les catégories"
  ON wishlist_categories
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Les utilisateurs peuvent gérer leurs catégories"
  ON wishlist_categories
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());