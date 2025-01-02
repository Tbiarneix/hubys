import { supabase } from '../supabase';
import toast from 'react-hot-toast';

export async function createSoloParent() {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error("Utilisateur non connecté");

    const { error } = await supabase
      .from('couples')
      .insert({
        user1_id: user.id,
        user2_id: user.id,
        status: 'accepte'
      });

    if (error) throw error;
  } catch (error) {
    console.error("Erreur lors de la création du parent solo:", error);
    throw error;
  }
}

export async function sendInvitation(partnerEmail: string) {
  try {
    // Vérifier si le partenaire existe
    const { data: partner, error: partnerError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', partnerEmail)
      .single();

    if (partnerError) {
      throw new Error("Utilisateur non trouvé");
    }

    // Créer l'invitation
    const { error } = await supabase
      .from('couples')
      .insert({
        user1_id: (await supabase.auth.getUser()).data.user?.id,
        user2_id: partner.id,
        status: 'en_attente'
      });

    if (error) throw error;

    toast.success("Invitation envoyée avec succès");
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Erreur lors de l'envoi de l'invitation");
    throw error;
  }
}

export async function acceptInvitation(coupleId: string) {
  try {
    const { error } = await supabase
      .from('couples')
      .update({ status: 'accepte' })
      .eq('id', coupleId);

    if (error) throw error;

    toast.success("Invitation acceptée");
  } catch (error) {
    toast.error("Erreur lors de l'acceptation de l'invitation");
    throw error;
  }
}

export async function rejectInvitation(coupleId: string) {
  try {
    const { error } = await supabase
      .from('couples')
      .delete()
      .eq('id', coupleId);

    if (error) throw error;

    toast.success("Invitation rejetée");
  } catch (error) {
    toast.error("Erreur lors du rejet de l'invitation");
    throw error;
  }
}

export async function endRelationship(coupleId: string) {
  try {
    const { error } = await supabase
      .from('couples')
      .delete()
      .eq('id', coupleId);

    if (error) throw error;

    toast.success("La relation a été terminée");
  } catch (error) {
    toast.error("Erreur lors de la fin de la relation");
    throw error;
  }
}