/*
  # Mise à jour des politiques RLS pour les couples

  1. Modifications
    - Mise à jour de la politique d'insertion pour permettre les relations "solo"
    - Ajout d'une politique spécifique pour les relations "solo"

  2. Sécurité
    - Les utilisateurs peuvent créer une relation solo avec eux-mêmes
    - Les utilisateurs peuvent créer des invitations vers d'autres utilisateurs
    - Les politiques existantes sont préservées
*/

-- Suppression de l'ancienne politique d'insertion
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des relations" ON couples;

-- Création des nouvelles politiques
CREATE POLICY "Les utilisateurs peuvent créer des relations solo"
  ON couples
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user1_id AND
    user1_id = user2_id AND
    status = 'accepte'
  );

CREATE POLICY "Les utilisateurs peuvent créer des invitations"
  ON couples
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user1_id AND
    user1_id != user2_id AND
    status = 'en_attente'
  );