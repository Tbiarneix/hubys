-- Mise à jour des politiques existantes
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs items" ON wishlist_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs items" ON wishlist_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs items et ceux de leur partenaire" ON wishlist_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs propres items" ON wishlist_items;
DROP POLICY IF EXISTS "Les partenaires peuvent sélectionner les items" ON wishlist_items;

-- Suppression du trigger et de la fonction existants
DROP TRIGGER IF EXISTS check_wishlist_item_update_trigger ON wishlist_items;
DROP FUNCTION IF EXISTS check_wishlist_item_update();

-- Politique de lecture pour les items
CREATE POLICY "Les utilisateurs peuvent voir leurs items et ceux de leur partenaire"
  ON wishlist_items
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM couples
      WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
      AND status = 'accepte'
      AND (
        user1_id = wishlist_items.user_id OR
        user2_id = wishlist_items.user_id
      )
    )
  );

-- Politique d'insertion pour les items
CREATE POLICY "Les utilisateurs peuvent créer leurs propres items"
  ON wishlist_items
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Politique de mise à jour et suppression pour les propriétaires
CREATE POLICY "Les utilisateurs peuvent gérer leurs propres items"
  ON wishlist_items
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Fonction pour vérifier que seul is_selected est modifié
CREATE OR REPLACE FUNCTION check_wishlist_item_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name != OLD.name OR
     NEW.url IS DISTINCT FROM OLD.url OR
     NEW.category_id IS DISTINCT FROM OLD.category_id OR
     NEW.user_id != OLD.user_id OR
     NEW.order != OLD.order OR
     NEW.created_at != OLD.created_at
  THEN
    RAISE EXCEPTION 'Seul le statut de sélection peut être modifié';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour vérifier les mises à jour
CREATE TRIGGER check_wishlist_item_update_trigger
  BEFORE UPDATE ON wishlist_items
  FOR EACH ROW
  WHEN (OLD.user_id != current_setting('request.jwt.claim.sub', true)::uuid)
  EXECUTE FUNCTION check_wishlist_item_update();