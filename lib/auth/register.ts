export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}

export async function registerUser(data: RegisterData): Promise<void> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de l\'inscription');
  }
}