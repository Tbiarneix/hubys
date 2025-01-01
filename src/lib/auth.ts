import { supabase } from './supabase';

export interface SignUpData {
  email: string;
  password: string;
  username: string;
}

export async function signUp({ email, password, username }: SignUpData) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error("L'inscription a échoué");
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .insert([{ id: authData.user.id, username }]);

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error("Erreur lors de la création du profil");
  }

  return authData;
}

export async function signIn({ email, password }: { email: string; password: string }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}