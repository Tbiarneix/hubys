import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { createWishlist } from '../services/wishlistService';
import toast from 'react-hot-toast';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  birth_date: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile(user: User) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        // Essayer de récupérer le profil existant
        let { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // Si le profil n'existe pas, le créer
        if (error && error.code === 'PGRST116') {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                username: user.email?.split('@')[0] || 'utilisateur',
              },
            ])
            .select()
            .single();

          if (insertError) throw insertError;
          data = newProfile;

          // Créer une liste de souhaits par défaut
          await createWishlist({
            title: 'Ma liste de souhaits',
            user_id: user.id
          });
        } else if (error) {
          throw error;
        } else {
          // Vérifier si l'utilisateur a une liste de souhaits
          const { data: wishlists } = await supabase
            .from('wishlists')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);

          if (!wishlists?.length) {
            // Créer une liste de souhaits par défaut si aucune n'existe
            await createWishlist({
              title: 'Ma liste de souhaits',
              user_id: user.id
            });
          }
        }

        setProfile(data);
      } catch (error) {
        toast.error("Erreur lors du chargement du profil");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user.id, user.email]);

  return { profile, loading, setProfile };
}