import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import type { Database } from '../database.types';
import toast from 'react-hot-toast';

type Couple = Database['public']['Tables']['couples']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export interface CoupleWithPartner extends Couple {
  partner: Profile;
}

export function useCouple(user: User) {
  const [couples, setCouples] = useState<CoupleWithPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCouples();
  }, [user.id]);

  async function loadCouples() {
    try {
      const { data, error } = await supabase
        .from('couples')
        .select(`
          *,
          partner:profiles!couples_user2_id_fkey(*)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (error) throw error;

      const formattedCouples = data.map(couple => ({
        ...couple,
        partner: couple.partner,
      }));

      setCouples(formattedCouples);
    } catch (error) {
      toast.error("Erreur lors du chargement des relations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return { couples, loading, reloadCouples: loadCouples };
}