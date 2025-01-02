/*
  # Migration des données vers la nouvelle structure
  
  1. Modifications
    - Création des listes par défaut pour les utilisateurs existants
    - Migration des catégories et items vers les nouvelles listes
    - Mise à jour des politiques RLS
  
  2. Sécurité
    - Ajout de politiques RLS pour la visibilité publique
    - Protection des opérations de modification
*/

-- Création des listes par défaut pour les utilisateurs existants
INSERT INTO wishlists (id, user_id, title)
SELECT 
  gen_random_uuid(),
  id,
  'Ma liste de souhaits'
FROM profiles
ON CONFLICT DO NOTHING;

-- Migration des catégories existantes
UPDATE wishlist_categories
SET wishlist_id = (
  SELECT id FROM wishlists WHERE user_id = wishlist_categories.user_id LIMIT 1
)
WHERE wishlist_id IS NULL;

-- Migration des items existants
UPDATE wishlist_items
SET wishlist_id = (
  SELECT id FROM wishlists WHERE user_id = wishlist_items.user_id LIMIT 1
)
WHERE wishlist_id IS NULL;

-- Mise à jour des politiques RLS
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les listes" ON wishlists;
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs listes" ON wishlists;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les catégories" ON wishlist_categories;
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs catégories" ON wishlist_categories;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les items" ON wishlist_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs items" ON wishlist_items;

-- Politiques pour les listes
CREATE POLICY "Tout le monde peut voir les listes"
  ON wishlists
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Les utilisateurs peuvent gérer leurs listes"
  ON wishlists
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Politiques pour les catégories
CREATE POLICY "Tout le monde peut voir les catégories"
  ON wishlist_categories
  FOR SELECT
  TO authenticated
  USING (true);

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
  );

-- Politiques pour les items
CREATE POLICY "Tout le monde peut voir les items"
  ON wishlist_items
  FOR SELECT
  TO authenticated
  USING (true);

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
  );