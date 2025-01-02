import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useProfile } from '../lib/hooks/useProfile';
import { ProfileSection } from '../components/dashboard/sections/ProfileSection';
import { CoupleSection } from '../components/dashboard/sections/CoupleSection';
import { ChildrenSection } from '../components/dashboard/sections/ChildrenSection';
import { WishlistPreview } from '../components/dashboard/sections/WishlistPreview';

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  const { profile, loading, setProfile } = useProfile(user);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  if (loading || !profile) {
    return <div className="animate-pulse bg-white rounded-lg h-48"></div>;
  }

  return (
    <div className="space-y-6">
      <ProfileSection 
        profile={profile}
        isEditing={isEditingProfile}
        onEdit={() => setIsEditingProfile(true)}
        onClose={() => setIsEditingProfile(false)}
        onUpdate={setProfile}
      />
      
      <CoupleSection user={user} />
      
      <ChildrenSection user={user} />

      <WishlistPreview user={user} />
    </div>
  );
}