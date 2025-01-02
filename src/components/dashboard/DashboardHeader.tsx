import { LogOut } from 'lucide-react';
import { signOut } from '../../lib/auth';
import { Logo } from '../Logo';
import toast from 'react-hot-toast';

export function DashboardHeader() {
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo />
          <button
            onClick={handleSignOut}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}