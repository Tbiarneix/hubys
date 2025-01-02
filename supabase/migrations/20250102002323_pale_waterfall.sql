/*
  # Ajout de la sélection des cadeaux

  1. Changements
    - Ajout de la colonne `is_selected` à la table `wishlist_items`
    - Mise à jour des politiques pour permettre aux partenaires de voir et sélectionner les cadeaux

  2. Sécurité
    - Les utilisateurs peuvent voir leurs propres cadeaux et ceux de leur partenaire
    - Les utilisateurs peuvent gérer leurs propres cadeaux
    - Les partenaires peuvent uniquement mettre à jour le statut de sélection
*/

-- Ajout de la colonne is_selected
ALTER TABLE wishlist_items
ADD COLUMN is_selected boolean DEFAULT false;

-- Mise à jour des politiques existantes
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs items" ON wishlist_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs items" ON wishlist_items;

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

-- Politique de gestion pour les items
CREATE POLICY "Les utilisateurs peuvent gérer leurs propres items"
  ON wishlist_items
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Politique de mise à jour pour les partenaires (uniquement is_selected)
CREATE POLICY "Les partenaires peuvent sélectionner les items"
  ON wishlist_items
  FOR UPDATE
  TO authenticated
  USING (
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
  WHEN (OLD.user_id != auth.uid())
  EXECUTE FUNCTION check_wishlist_item_update();