/*
  # Migration des listes de souhaits

  Cette migration :
  1. Crée des listes par défaut pour tous les utilisateurs
  2. Migre les données existantes de manière sécurisée
  3. Ajoute les contraintes NOT NULL une fois les données migrées
*/

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

-- Migration des données existantes
DO $$ 
BEGIN
  -- Migration des catégories existantes
  UPDATE wishlist_categories wc
  SET wishlist_id = (
    SELECT id 
    FROM wishlists w 
    WHERE w.user_id = wc.user_id 
    ORDER BY w.created_at ASC 
    LIMIT 1
  )
  WHERE wishlist_id IS NULL;

  -- Migration des items existants
  UPDATE wishlist_items wi
  SET wishlist_id = (
    SELECT id 
    FROM wishlists w 
    WHERE w.user_id = wi.user_id 
    ORDER BY w.created_at ASC 
    LIMIT 1
  )
  WHERE wishlist_id IS NULL;
END $$;

-- Suppression des données orphelines
DELETE FROM wishlist_categories WHERE wishlist_id IS NULL;
DELETE FROM wishlist_items WHERE wishlist_id IS NULL;

-- Ajout des contraintes NOT NULL
ALTER TABLE wishlist_categories ALTER COLUMN wishlist_id SET NOT NULL;
ALTER TABLE wishlist_items ALTER COLUMN wishlist_id SET NOT NULL;

-- Mise à jour des politiques RLS
DO $$ 
BEGIN
  -- Suppression des politiques existantes
  DROP POLICY IF EXISTS "Tout le monde peut voir les listes" ON wishlists;
  DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs listes" ON wishlists;
  DROP POLICY IF EXISTS "Tout le monde peut voir les catégories" ON wishlist_categories;
  DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs catégories" ON wishlist_categories;
  DROP POLICY IF EXISTS "Tout le monde peut voir les items" ON wishlist_items;
  DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs items" ON wishlist_items;

  -- Création des nouvelles politiques
  CREATE POLICY "Tout le monde peut voir les listes"
    ON wishlists
    FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Les utilisateurs peuvent gérer leurs listes"
    ON wishlists
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

  CREATE POLICY "Tout le monde peut voir les catégories"
    ON wishlist_categories
    FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Les utilisateurs peuvent gérer leurs catégories"
    ON wishlist_categories
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM wishlists
        WHERE id = wishlist_categories.wishlist_id
        AND user_id = auth.uid()
      )
    );

  CREATE POLICY "Tout le monde peut voir les items"
    ON wishlist_items
    FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Les utilisateurs peuvent gérer leurs items"
    ON wishlist_items
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM wishlists
        WHERE id = wishlist_items.wishlist_id
        AND user_id = auth.uid()
      )
    );
END $$;