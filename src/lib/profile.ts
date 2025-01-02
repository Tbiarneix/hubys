import { supabase } from './supabase';
import type { Profile } from './hooks/useProfile';
import toast from 'react-hot-toast';

export async function updateProfile(profile: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .select()
    .single();

  if (error) {
    toast.error('Erreur lors de la mise à jour du profil');
    throw error;
  }

  toast.success('Profil mis à jour avec succès');
  return data;
}