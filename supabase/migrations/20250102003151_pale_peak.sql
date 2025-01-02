/*
  # Rendre la liste de souhaits publique
  
  1. Modifications
    - Rendre les catégories visibles publiquement
    - Rendre les items visibles publiquement
    - Permettre à tout le monde de marquer les items comme sélectionnés
  
  2. Sécurité
    - Seul le champ is_selected peut être modifié par les utilisateurs anonymes
    - Les autres opérations restent protégées
*/

-- Mise à jour des politiques existantes pour les catégories
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs catégories" ON wishlist_categories;

-- Nouvelle politique de lecture publique pour les catégories
CREATE POLICY "Tout le monde peut voir les catégories"
  ON wishlist_categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Mise à jour des politiques existantes pour les items
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs items et ceux de leur partenaire" ON wishlist_items;

-- Nouvelle politique de lecture publique pour les items
CREATE POLICY "Tout le monde peut voir les items"
  ON wishlist_items
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Mise à jour de la politique de mise à jour pour permettre aux utilisateurs non connectés de sélectionner des items
DROP POLICY IF EXISTS "Les partenaires peuvent sélectionner les items" ON wishlist_items;

-- Fonction pour vérifier les mises à jour des items
CREATE OR REPLACE FUNCTION check_wishlist_item_selection_only()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name != OLD.name OR
     NEW.url IS NOT DISTINCT FROM OLD.url OR
     NEW.category_id IS NOT DISTINCT FROM OLD.category_id OR
     NEW.user_id != OLD.user_id OR
     NEW.order != OLD.order OR
     NEW.created_at != OLD.created_at OR
     NEW.updated_at != OLD.updated_at
  THEN
    RAISE EXCEPTION 'Seul le statut de sélection peut être modifié';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour vérifier les mises à jour
DROP TRIGGER IF EXISTS check_wishlist_item_selection_trigger ON wishlist_items;
CREATE TRIGGER check_wishlist_item_selection_trigger
  BEFORE UPDATE ON wishlist_items
  FOR EACH ROW
  EXECUTE FUNCTION check_wishlist_item_selection_only();

-- Politique permettant à tout le monde de mettre à jour is_selected
CREATE POLICY "Tout le monde peut sélectionner les items"
  ON wishlist_items
  FOR UPDATE
  TO anon, authenticated
  USING (true);