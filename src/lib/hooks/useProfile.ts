import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

export interface Profile {
  username: string;
}

export function useProfile(user: User) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        toast.error("Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user.id]);

  return { profile, loading };
}