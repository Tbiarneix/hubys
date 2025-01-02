-- Mise à jour des politiques pour les catégories
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs catégories" ON wishlist_categories;

CREATE POLICY "Les utilisateurs peuvent gérer leurs catégories et celles de leurs enfants"
  ON wishlist_categories
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM children c
      JOIN couples cp ON c.couple_id = cp.id
      WHERE c.id = wishlist_categories.user_id
      AND cp.status = 'accepte'
      AND (cp.user1_id = auth.uid() OR cp.user2_id = auth.uid())
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM children c
      JOIN couples cp ON c.couple_id = cp.id
      WHERE c.id = wishlist_categories.user_id
      AND cp.status = 'accepte'
      AND (cp.user1_id = auth.uid() OR cp.user2_id = auth.uid())
    )
  );

-- Mise à jour des politiques pour les items
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs propres items" ON wishlist_items;

CREATE POLICY "Les utilisateurs peuvent gérer leurs items et ceux de leurs enfants"
  ON wishlist_items
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM children c
      JOIN couples cp ON c.couple_id = cp.id
      WHERE c.id = wishlist_items.user_id
      AND cp.status = 'accepte'
      AND (cp.user1_id = auth.uid() OR cp.user2_id = auth.uid())
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM children c
      JOIN couples cp ON c.couple_id = cp.id
      WHERE c.id = wishlist_items.user_id
      AND cp.status = 'accepte'
      AND (cp.user1_id = auth.uid() OR cp.user2_id = auth.uid())
    )
  );