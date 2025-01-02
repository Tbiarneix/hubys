/*
  # Mise à jour de la contrainte des couples

  1. Modifications
    - Suppression de l'ancienne contrainte qui empêchait user1_id = user2_id
    - Ajout d'une nouvelle contrainte qui permet les relations solo

  2. Sécurité
    - Les utilisateurs peuvent être en relation solo (user1_id = user2_id)
    - Les relations non-solo doivent toujours avoir des utilisateurs différents
*/

-- Suppression de l'ancienne contrainte
ALTER TABLE couples DROP CONSTRAINT IF EXISTS couples_check;

-- Ajout de la nouvelle contrainte
ALTER TABLE couples ADD CONSTRAINT couples_check CHECK (
  CASE
    WHEN status = 'accepte' THEN true  -- Permet user1_id = user2_id pour les relations acceptées
    ELSE user1_id != user2_id         -- Empêche user1_id = user2_id pour les invitations
  END
);