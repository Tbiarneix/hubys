import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { User } from '@supabase/supabase-js';
import { AuthForm } from './components/auth/AuthForm';
import { Logo } from './components/Logo';
import { supabase } from './lib/supabase';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Wishlist } from './pages/Wishlist';
import { Child } from './pages/Child';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md space-y-8">
            <Logo />
            <AuthForm />
          </div>
        </div>
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout user={user} />}>
          <Route index element={<Dashboard user={user} />} />
          <Route path="wishlist" element={<Wishlist user={user} />} />
          <Route path="child/:id" element={<Child user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}