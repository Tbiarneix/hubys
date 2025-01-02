-- Suppression des contraintes NOT NULL existantes pour permettre la migration
ALTER TABLE wishlist_categories ALTER COLUMN wishlist_id DROP NOT NULL;
ALTER TABLE wishlist_items ALTER COLUMN wishlist_id DROP NOT NULL;

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
  v_count int;
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
    -- Récupérer la liste existante ou en créer une nouvelle
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

  -- Vérifier qu'il n'y a plus de données sans wishlist_id
  SELECT COUNT(*) INTO v_count
  FROM (
    SELECT id FROM wishlist_categories WHERE wishlist_id IS NULL
    UNION ALL
    SELECT id FROM wishlist_items WHERE wishlist_id IS NULL
  ) orphans;

  IF v_count > 0 THEN
    RAISE EXCEPTION 'Il reste des données sans wishlist_id';
  END IF;
END $$;

-- Ajout des contraintes NOT NULL
ALTER TABLE wishlist_categories ALTER COLUMN wishlist_id SET NOT NULL;
ALTER TABLE wishlist_items ALTER COLUMN wishlist_id SET NOT NULL;