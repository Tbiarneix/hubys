-- Mise à jour de la fonction de vérification pour permettre la mise à jour de is_selected
CREATE OR REPLACE FUNCTION check_wishlist_item_selection_only()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier que seul is_selected est modifié
  IF NEW.name != OLD.name OR
     NEW.url IS DISTINCT FROM OLD.url OR
     NEW.category_id IS DISTINCT FROM OLD.category_id OR
     NEW.user_id != OLD.user_id OR
     NEW.order != OLD.order
  THEN
    RAISE EXCEPTION 'Seul le statut de sélection peut être modifié';
  END IF;

  -- Permettre la mise à jour de is_selected et updated_at
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;