/*
  # Fix wishlist items creation

  1. Changes
    - Update RLS policies for wishlist items
    - Add better error handling for owner constraints
    - Fix policy checks for child items

  2. Security
    - Maintain proper access control
    - Ensure data integrity with owner constraints
*/

-- Update RLS policies for items
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs items" ON wishlist_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs items" ON wishlist_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs items" ON wishlist_items;

CREATE POLICY "Les utilisateurs peuvent gérer leurs items"
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

-- Add trigger to ensure proper owner assignment
CREATE OR REPLACE FUNCTION check_wishlist_item_owner()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.user_id IS NULL AND NEW.child_id IS NULL) OR 
     (NEW.user_id IS NOT NULL AND NEW.child_id IS NOT NULL) THEN
    RAISE EXCEPTION 'Either user_id or child_id must be set, but not both';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_wishlist_item_owner_trigger
  BEFORE INSERT OR UPDATE ON wishlist_items
  FOR EACH ROW
  EXECUTE FUNCTION check_wishlist_item_owner();