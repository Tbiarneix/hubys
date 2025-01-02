/*
  # Mise à jour des politiques RLS pour les items

  1. Changements
    - Ajout d'une politique spécifique pour l'insertion d'items
    - Séparation des politiques pour plus de clarté
*/

-- Suppression de la politique existante
DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leurs items" ON wishlist_items;

-- Création de politiques distinctes pour chaque opération
CREATE POLICY "Les utilisateurs peuvent créer leurs items"
  ON wishlist_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs items"
  ON wishlist_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs items"
  ON wishlist_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);