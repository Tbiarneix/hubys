import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { gql, useMutation } from '@apollo/client';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $firstName: String!, $lastName: String) {
    register(email: $email, password: $password, firstName: $firstName, lastName: $lastName) {
      token
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const [login] = useMutation(LOGIN_MUTATION);
  const [register] = useMutation(REGISTER_MUTATION);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Vérifier la validité du token et récupérer les informations utilisateur
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const { data } = await login({ variables: { email, password } });
      localStorage.setItem('token', data.login.token);
      setUser(data.login.user);
      router.push('/dashboard');
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const handleRegister = async (email: string, password: string, firstName: string, lastName?: string) => {
    try {
      const { data } = await register({
        variables: { email, password, firstName, lastName },
      });
      localStorage.setItem('token', data.register.token);
      setUser(data.register.user);
      router.push('/dashboard');
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return {
    user,
    login: handleLogin,
    register: handleRegister,
    logout,
    isAuthenticated: !!user,
  };
};