/*
  # Mise à jour des listes de souhaits

  1. Modifications
    - Ajout de la colonne title à la table wishlists
    - Migration des données existantes
    - Mise à jour des politiques RLS

  2. Sécurité
    - Maintien des politiques RLS existantes
    - Ajout de contraintes NOT NULL
*/

-- Ajout de la colonne title si elle n'existe pas déjà
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wishlists' AND column_name = 'title'
  ) THEN
    ALTER TABLE wishlists ADD COLUMN title text;
  END IF;
END $$;

-- S'assurer que title est NOT NULL
ALTER TABLE wishlists 
ALTER COLUMN title SET NOT NULL;

-- Mise à jour des politiques RLS
DROP POLICY IF EXISTS "Tout le monde peut voir les listes" ON wishlists;
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs listes" ON wishlists;

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