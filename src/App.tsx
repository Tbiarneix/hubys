import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { User } from '@supabase/supabase-js';
import { Logo } from './components/Logo';
import { AuthForm } from './components/auth/AuthForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { supabase } from './lib/supabase';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Récupérer la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      {user ? (
        <Dashboard user={user} />
      ) : (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md space-y-8">
            <Logo />
            <AuthForm />
          </div>
        </div>
      )}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181B',
            color: '#fff',
          },
        }} 
      />
    </>
  );
}