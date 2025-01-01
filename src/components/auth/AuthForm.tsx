import { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { InputField } from '../ui/InputField';
import { signUp, signIn } from '../../lib/auth';
import toast from 'react-hot-toast';

type AuthMode = 'login' | 'register';

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          toast.error('Les mots de passe ne correspondent pas');
          return;
        }
        await signUp({ email, password, username });
        toast.success('Compte créé avec succès !');
        setMode('login');
      } else {
        await signIn({ email, password });
        toast.success('Connexion réussie !');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          {mode === 'login' ? 'Connexion' : 'Inscription'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === 'register' && (
          <InputField
            id="username"
            label="Nom d'utilisateur"
            type="text"
            value={username}
            onChange={setUsername}
            Icon={User}
            required
          />
        )}

        <InputField
          id="email"
          label="Adresse email"
          type="email"
          value={email}
          onChange={setEmail}
          Icon={Mail}
          required
        />

        <InputField
          id="password"
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={setPassword}
          Icon={Lock}
          required
          showPasswordToggle
          onTogglePassword={() => setShowPassword(!showPassword)}
          isPasswordVisible={showPassword}
        />

        {mode === 'register' && (
          <InputField
            id="confirmPassword"
            label="Confirmer le mot de passe"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={setConfirmPassword}
            Icon={Lock}
            required
            showPasswordToggle
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            isPasswordVisible={showConfirmPassword}
          />
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setPassword('');
              setConfirmPassword('');
              setShowPassword(false);
              setShowConfirmPassword(false);
            }}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {mode === 'login' 
              ? "Pas encore de compte ? S'inscrire" 
              : 'Déjà un compte ? Se connecter'}
          </button>
        </div>
      </form>
    </div>
  );
}