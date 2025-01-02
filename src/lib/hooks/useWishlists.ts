import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Wishlist } from '../types/wishlist';
import toast from 'react-hot-toast';

export function useWishlists(userId: string) {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlists();
  }, [userId]);

  async function loadWishlists() {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlists(data || []);
    } catch (error) {
      toast.error("Erreur lors du chargement des listes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return { wishlists, loading, reloadWishlists: loadWishlists };
}