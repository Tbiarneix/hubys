import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { DashboardHeader } from './DashboardHeader';
import { ProfileSection } from './sections/ProfileSection';
import { CoupleSection } from './sections/CoupleSection';
import { ChildrenSection } from './sections/ChildrenSection';
import { WishlistSection } from './sections/WishlistSection';
import { useProfile } from '../../lib/hooks/useProfile';

export function Dashboard({ user }: { user: User }) {
  const { profile, loading, setProfile } = useProfile(user);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="animate-pulse bg-white rounded-lg h-48"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          <ProfileSection 
            profile={profile}
            isEditing={isEditingProfile}
            onEdit={() => setIsEditingProfile(true)}
            onClose={() => setIsEditingProfile(false)}
            onUpdate={setProfile}
          />
          
          <CoupleSection user={user} />
          
          <ChildrenSection user={user} />

          <WishlistSection user={user} />
        </div>
      </main>
    </div>
  );
}