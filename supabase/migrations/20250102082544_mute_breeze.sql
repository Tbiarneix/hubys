-- Création des listes par défaut pour tous les utilisateurs
INSERT INTO wishlists (id, user_id, title)
SELECT 
  gen_random_uuid(),
  id,
  'Ma liste de souhaits'
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM wishlists w WHERE w.user_id = p.id
);

-- Migration des données existantes de manière sécurisée
DO $$ 
DECLARE
  v_wishlist_id uuid;
  v_user_id uuid;
BEGIN
  -- Pour chaque utilisateur qui a des catégories ou des items sans wishlist_id
  FOR v_user_id IN (
    SELECT DISTINCT user_id 
    FROM (
      SELECT user_id FROM wishlist_categories WHERE wishlist_id IS NULL
      UNION
      SELECT user_id FROM wishlist_items WHERE wishlist_id IS NULL
    ) users
  ) LOOP
    -- Récupérer ou créer une liste pour l'utilisateur
    SELECT id INTO v_wishlist_id
    FROM wishlists
    WHERE user_id = v_user_id
    ORDER BY created_at ASC
    LIMIT 1;

    IF v_wishlist_id IS NULL THEN
      -- Créer une nouvelle liste si aucune n'existe
      v_wishlist_id := gen_random_uuid();
      INSERT INTO wishlists (id, user_id, title)
      VALUES (v_wishlist_id, v_user_id, 'Ma liste de souhaits');
    END IF;

    -- Mettre à jour les catégories
    UPDATE wishlist_categories
    SET wishlist_id = v_wishlist_id
    WHERE user_id = v_user_id
    AND wishlist_id IS NULL;

    -- Mettre à jour les items
    UPDATE wishlist_items
    SET wishlist_id = v_wishlist_id
    WHERE user_id = v_user_id
    AND wishlist_id IS NULL;
  END LOOP;
END $$;

-- Vérification finale et ajout des contraintes
DO $$ 
BEGIN
  -- Supprimer les données orphelines si nécessaire
  DELETE FROM wishlist_categories WHERE wishlist_id IS NULL;
  DELETE FROM wishlist_items WHERE wishlist_id IS NULL;

  -- Ajouter les contraintes NOT NULL
  ALTER TABLE wishlist_categories ALTER COLUMN wishlist_id SET NOT NULL;
  ALTER TABLE wishlist_items ALTER COLUMN wishlist_id SET NOT NULL;
END $$;