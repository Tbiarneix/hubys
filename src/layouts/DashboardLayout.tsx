import { Outlet } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';

interface DashboardLayoutProps {
  user: User;
}

export function DashboardLayout({ user }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}