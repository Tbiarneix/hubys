import { User } from '@supabase/supabase-js';
import { CoupleStatus } from '../../couple/CoupleStatus';
import { CoupleInvitations } from '../../couple/CoupleInvitations';

interface CoupleSectionProps {
  user: User;
  isEditing: boolean;
}

export function CoupleSection({ user, isEditing }: CoupleSectionProps) {
  if (!isEditing) return null;

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Relation</h2>
      <CoupleInvitations user={user} />
      <CoupleStatus user={user} />
    </section>
  );
}