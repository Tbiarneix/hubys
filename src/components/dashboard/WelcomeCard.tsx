import { Profile } from '../../lib/hooks/useProfile';

interface WelcomeCardProps {
  profile: Profile | null;
  loading: boolean;
}

export function WelcomeCard({ profile, loading }: WelcomeCardProps) {
  if (loading) {
    return (
      <div className="bg-white overflow-hidden shadow-sm rounded-lg animate-pulse">
        <div className="px-4 py-5 sm:p-6">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-xl font-medium text-gray-900">
          Bienvenue {profile?.username} !
        </h2>
      </div>
    </div>
  );
}