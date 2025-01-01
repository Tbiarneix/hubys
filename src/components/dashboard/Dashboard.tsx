import { User } from '@supabase/supabase-js';
import { DashboardHeader } from './DashboardHeader';
import { WelcomeCard } from './WelcomeCard';
import { useProfile } from '../../lib/hooks/useProfile';

export function Dashboard({ user }: { user: User }) {
  const { profile, loading } = useProfile(user);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <WelcomeCard profile={profile} loading={loading} />
        </div>
      </main>
    </div>
  );
}