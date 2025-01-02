-- Add NOT NULL constraints to ensure proper ownership
ALTER TABLE wishlist_items
ALTER COLUMN is_selected SET DEFAULT false,
ALTER COLUMN is_selected SET NOT NULL;

-- Add check constraints to ensure proper ownership
ALTER TABLE wishlist_items DROP CONSTRAINT IF EXISTS wishlist_items_owner_check;
ALTER TABLE wishlist_items ADD CONSTRAINT wishlist_items_owner_check 
CHECK (
  (user_id IS NOT NULL AND child_id IS NULL) OR 
  (user_id IS NULL AND child_id IS NOT NULL)
);

-- Update RLS policies
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les items" ON wishlist_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs items" ON wishlist_items;

-- Policy for viewing items
CREATE POLICY "Les utilisateurs peuvent voir les items"
  ON wishlist_items
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    child_id IN (
      SELECT c.id FROM children c
      JOIN couples cp ON c.couple_id = cp.id
      WHERE cp.status = 'accepte'
      AND (cp.user1_id = auth.uid() OR cp.user2_id = auth.uid())
    )
  );

-- Policy for managing items
CREATE POLICY "Les utilisateurs peuvent gérer leurs items"
  ON wishlist_items
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    child_id IN (
      SELECT c.id FROM children c
      JOIN couples cp ON c.couple_id = cp.id
      WHERE cp.status = 'accepte'
      AND (cp.user1_id = auth.uid() OR cp.user2_id = auth.uid())
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR
    child_id IN (
      SELECT c.id FROM children c
      JOIN couples cp ON c.couple_id = cp.id
      WHERE cp.status = 'accepte'
      AND (cp.user1_id = auth.uid() OR cp.user2_id = auth.uid())
    )
  );