-- Ajout de la colonne selector_name
ALTER TABLE wishlist_items
ADD COLUMN selector_name text;

-- Mise à jour de la fonction de vérification
CREATE OR REPLACE FUNCTION check_wishlist_item_selection_only()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier que seuls is_selected et selector_name sont modifiés
  IF NEW.name != OLD.name OR
     NEW.url IS DISTINCT FROM OLD.url OR
     NEW.category_id IS DISTINCT FROM OLD.category_id OR
     NEW.user_id != OLD.user_id OR
     NEW.order != OLD.order
  THEN
    RAISE EXCEPTION 'Seuls le statut de sélection et le nom du sélectionneur peuvent être modifiés';
  END IF;

  -- Permettre la mise à jour de is_selected, selector_name et updated_at
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;