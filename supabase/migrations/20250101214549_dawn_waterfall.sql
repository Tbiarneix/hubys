/*
  # Add insert policy for profiles

  1. Security Changes
    - Add RLS policy to allow profile creation during signup
    - Policy ensures users can only create their own profile
*/

CREATE POLICY "Les utilisateurs peuvent créer leur propre profil"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);