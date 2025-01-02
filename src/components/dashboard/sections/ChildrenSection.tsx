import { User } from '@supabase/supabase-js';
import { useEffect } from 'react';
import { useCouple } from '../../../lib/hooks/useCouple';
import { ChildrenList } from '../../children/ChildrenList';
import { AddChildForm } from '../../children/AddChildForm';
import { createSoloParent } from '../../../lib/services/coupleService';
import { useChildren } from '../../../lib/hooks/useChildren';

interface ChildrenSectionProps {
  user: User;
  isEditing: boolean;
}

export function ChildrenSection({ user, isEditing }: ChildrenSectionProps) {
  const { couples, loading: loadingCouple, reloadCouples } = useCouple(user);
  const { reloadChildren } = useChildren(user);
  
  useEffect(() => {
    async function ensureParentStatus() {
      if (!loadingCouple && couples.length === 0) {
        try {
          await createSoloParent();
          reloadCouples();
        } catch (error) {
          console.error("Erreur lors de la création du parent solo:", error);
        }
      }
    }
    ensureParentStatus();
  }, [loadingCouple, couples.length, reloadCouples]);

  if (!isEditing) return null;

  const activeCouple = couples.find(couple => couple.status === 'accepte');

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Enfants</h2>
      
      <ChildrenList user={user} />
      
      {activeCouple && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ajouter un enfant</h3>
          <AddChildForm 
            couple={activeCouple} 
            onChildAdded={reloadChildren} 
          />
        </div>
      )}
    </section>
  );
}