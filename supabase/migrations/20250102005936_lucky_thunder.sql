/*
  # Mise à jour du schéma des listes de souhaits

  1. Modifications
    - Ajout d'une colonne child_id pour référencer les enfants
    - Mise à jour des contraintes de clé étrangère
    - Mise à jour des politiques RLS

  2. Sécurité
    - Maintien des politiques existantes
    - Ajout de nouvelles politiques pour les listes d'enfants
*/

-- Ajout de la colonne child_id aux tables
ALTER TABLE wishlist_categories
ADD COLUMN child_id uuid REFERENCES children(id) ON DELETE CASCADE;

ALTER TABLE wishlist_items
ADD COLUMN child_id uuid REFERENCES children(id) ON DELETE CASCADE;

-- Mise à jour des politiques pour les catégories
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs catégories et celles de leurs enfants" ON wishlist_categories;

CREATE POLICY "Les utilisateurs peuvent gérer les catégories"
  ON wishlist_categories
  FOR ALL
  TO authenticated
  USING (
    (user_id = auth.uid() AND child_id IS NULL) OR
    (child_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM children c
      JOIN couples cp ON c.couple_id = cp.id
      WHERE c.id = wishlist_categories.child_id
      AND cp.status = 'accepte'
      AND (cp.user1_id = auth.uid() OR cp.user2_id = auth.uid())
    ))
  )
  WITH CHECK (
    (user_id = auth.uid() AND child_id IS NULL) OR
    (child_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM children c
      JOIN couples cp ON c.couple_id = cp.id
      WHERE c.id = wishlist_categories.child_id
      AND cp.status = 'accepte'
      AND (cp.user1_id = auth.uid() OR cp.user2_id = auth.uid())
    ))
  );

-- Mise à jour des politiques pour les items
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs items et ceux de leurs enfants" ON wishlist_items;

CREATE POLICY "Les utilisateurs peuvent gérer les items"
  ON wishlist_items
  FOR ALL
  TO authenticated
  USING (
    (user_id = auth.uid() AND child_id IS NULL) OR
    (child_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM children c
      JOIN couples cp ON c.couple_id = cp.id
      WHERE c.id = wishlist_items.child_id
      AND cp.status = 'accepte'
      AND (cp.user1_id = auth.uid() OR cp.user2_id = auth.uid())
    ))
  )
  WITH CHECK (
    (user_id = auth.uid() AND child_id IS NULL) OR
    (child_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM children c
      JOIN couples cp ON c.couple_id = cp.id
      WHERE c.id = wishlist_items.child_id
      AND cp.status = 'accepte'
      AND (cp.user1_id = auth.uid() OR cp.user2_id = auth.uid())
    ))
  );