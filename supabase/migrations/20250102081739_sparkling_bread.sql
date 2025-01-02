/*
  # Mise à jour des politiques RLS et des contraintes

  Cette migration :
  1. Supprime les anciennes politiques si elles existent
  2. Crée de nouvelles politiques pour les listes, catégories et items
  3. Met à jour les contraintes sur wishlist_id
*/

-- Suppression sécurisée des politiques existantes
DO $$ 
BEGIN
  -- Politiques pour les listes
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'wishlists' 
    AND policyname = 'Tout le monde peut voir les listes'
  ) THEN
    DROP POLICY "Tout le monde peut voir les listes" ON wishlists;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'wishlists' 
    AND policyname = 'Les utilisateurs peuvent gérer leurs listes'
  ) THEN
    DROP POLICY "Les utilisateurs peuvent gérer leurs listes" ON wishlists;
  END IF;

  -- Politiques pour les catégories
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'wishlist_categories' 
    AND policyname = 'Tout le monde peut voir les catégories'
  ) THEN
    DROP POLICY "Tout le monde peut voir les catégories" ON wishlist_categories;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'wishlist_categories' 
    AND policyname = 'Les utilisateurs peuvent gérer leurs catégories'
  ) THEN
    DROP POLICY "Les utilisateurs peuvent gérer leurs catégories" ON wishlist_categories;
  END IF;

  -- Politiques pour les items
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'wishlist_items' 
    AND policyname = 'Tout le monde peut voir les items'
  ) THEN
    DROP POLICY "Tout le monde peut voir les items" ON wishlist_items;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'wishlist_items' 
    AND policyname = 'Les utilisateurs peuvent gérer leurs items'
  ) THEN
    DROP POLICY "Les utilisateurs peuvent gérer leurs items" ON wishlist_items;
  END IF;
END $$;

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

-- Mise à jour des contraintes pour wishlist_items
UPDATE wishlist_items
SET wishlist_id = (
  SELECT id FROM wishlists WHERE user_id = wishlist_items.user_id LIMIT 1
)
WHERE wishlist_id IS NULL;

-- Ajout de la contrainte NOT NULL
ALTER TABLE wishlist_items
ALTER COLUMN wishlist_id SET NOT NULL;