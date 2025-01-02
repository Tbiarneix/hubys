import { supabase } from '../supabase';
import toast from 'react-hot-toast';

interface AddChildData {
  first_name: string;
  birth_date: string;
  couple_id: string;
}

export async function addChild(data: AddChildData) {
  try {
    const { error } = await supabase
      .from('children')
      .insert(data);

    if (error) throw error;

    toast.success("Enfant ajouté avec succès");
  } catch (error) {
    toast.error("Erreur lors de l'ajout de l'enfant");
    throw error;
  }
}

export async function deleteChild(childId: string) {
  try {
    const { error } = await supabase
      .from('children')
      .delete()
      .eq('id', childId);

    if (error) throw error;

    toast.success("Enfant supprimé avec succès");
  } catch (error) {
    toast.error("Erreur lors de la suppression de l'enfant");
    throw error;
  }
}