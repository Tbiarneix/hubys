import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import type { Database } from '../database.types';
import toast from 'react-hot-toast';

export type Child = Database['public']['Tables']['children']['Row'];

export function useChildren(user: User) {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, [user.id]);

  async function loadChildren() {
    try {
      const { data, error } = await supabase
        .from('children')
        .select(`
          *,
          couples!inner(*)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`, { foreignTable: 'couples' })
        .eq('couples.status', 'accepte');

      if (error) throw error;

      setChildren(data || []);
    } catch (error) {
      toast.error("Erreur lors du chargement des enfants");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return { children, loading, reloadChildren: loadChildren };
}