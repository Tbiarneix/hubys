-- Mise à jour des politiques pour les listes
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs listes" ON wishlists;
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs listes" ON wishlists;

CREATE POLICY "Les utilisateurs peuvent voir les listes"
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

-- Mise à jour des politiques pour les catégories
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les catégories" ON wishlist_categories;
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs catégories" ON wishlist_categories;

CREATE POLICY "Les utilisateurs peuvent voir les catégories"
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

-- Mise à jour des politiques pour les items
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les items" ON wishlist_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs items" ON wishlist_items;

CREATE POLICY "Les utilisateurs peuvent voir les items"
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