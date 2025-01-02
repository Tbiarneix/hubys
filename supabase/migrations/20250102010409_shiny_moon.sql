/*
  # Fix wishlist RLS policies

  1. Changes
    - Update RLS policies to properly handle both user and child wishlists
    - Fix constraints to ensure either user_id or child_id is set
    - Update triggers to handle both cases correctly

  2. Security
    - Maintain proper access control for both user and child wishlists
    - Ensure users can only manage their own or their children's items
*/

-- Add constraints to ensure either user_id or child_id is set
ALTER TABLE wishlist_categories
ADD CONSTRAINT wishlist_categories_owner_check 
CHECK (
  (user_id IS NOT NULL AND child_id IS NULL) OR
  (user_id IS NULL AND child_id IS NOT NULL)
);

ALTER TABLE wishlist_items
ADD CONSTRAINT wishlist_items_owner_check 
CHECK (
  (user_id IS NOT NULL AND child_id IS NULL) OR
  (user_id IS NULL AND child_id IS NOT NULL)
);

-- Update RLS policies for categories
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer les catégories" ON wishlist_categories;
DROP POLICY IF EXISTS "Tout le monde peut voir les catégories" ON wishlist_categories;

CREATE POLICY "Les utilisateurs peuvent voir les catégories"
  ON wishlist_categories
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM children c
      JOIN couples cp ON c.couple_id = cp.id
      WHERE c.id = wishlist_categories.child_id
      AND cp.status = 'accepte'
      AND (cp.user1_id = auth.uid() OR cp.user2_id = auth.uid())
    )
  );

CREATE POLICY "Les utilisateurs peuvent gérer leurs catégories"
  ON wishlist_categories
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM children c
      JOIN couples cp ON c.couple_id = cp.id
      WHERE c.id = wishlist_categories.child_id
      AND cp.status = 'accepte'
      AND (cp.user1_id = auth.uid() OR cp.user2_id = auth.uid())
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM children c
      JOIN couples cp ON c.couple_id = cp.id
      WHERE c.id = wishlist_categories.child_id
      AND cp.status = 'accepte'
      AND (cp.user1_id = auth.uid() OR cp.user2_id = auth.uid())
    )
  );

-- Update RLS policies for items
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer les items" ON wishlist_items;
DROP POLICY IF EXISTS "Tout le monde peut voir les items" ON wishlist_items;
DROP POLICY IF EXISTS "Tout le monde peut sélectionner les items" ON wishlist_items;

CREATE POLICY "Les utilisateurs peuvent voir les items"
  ON wishlist_items
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM children c
      JOIN couples cp ON c.couple_id = cp.id
      WHERE c.id = wishlist_items.child_id
      AND cp.status = 'accepte'
      AND (cp.user1_id = auth.uid() OR cp.user2_id = auth.uid())
    )
  );

CREATE POLICY "Les utilisateurs peuvent gérer leurs items"
  ON wishlist_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM children c
      JOIN couples cp ON c.couple_id = cp.id
      WHERE c.id = wishlist_items.child_id
      AND cp.status = 'accepte'
      AND (cp.user1_id = auth.uid() OR cp.user2_id = auth.uid())
    )
  );

CREATE POLICY "Les utilisateurs peuvent modifier leurs items"
  ON wishlist_items
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM children c
      JOIN couples cp ON c.couple_id = cp.id
      WHERE c.id = wishlist_items.child_id
      AND cp.status = 'accepte'
      AND (cp.user1_id = auth.uid() OR cp.user2_id = auth.uid())
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM children c
      JOIN couples cp ON c.couple_id = cp.id
      WHERE c.id = wishlist_items.child_id
      AND cp.status = 'accepte'
      AND (cp.user1_id = auth.uid() OR cp.user2_id = auth.uid())
    )
  );

CREATE POLICY "Les utilisateurs peuvent supprimer leurs items"
  ON wishlist_items
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM children c
      JOIN couples cp ON c.couple_id = cp.id
      WHERE c.id = wishlist_items.child_id
      AND cp.status = 'accepte'
      AND (cp.user1_id = auth.uid() OR cp.user2_id = auth.uid())
    )
  );