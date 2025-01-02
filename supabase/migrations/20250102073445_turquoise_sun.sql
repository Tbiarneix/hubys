/*
  # Ajout des commentaires pour les listes de souhaits

  1. Modifications
    - Ajout de la colonne `comment` à la table `wishlist_categories`
    - Ajout de la colonne `comment` à la table `profiles`
*/

-- Ajout des colonnes de commentaires
ALTER TABLE wishlist_categories
ADD COLUMN comment text;

ALTER TABLE profiles
ADD COLUMN wishlist_comment text;