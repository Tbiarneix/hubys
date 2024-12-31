export async function getPublicUser(userId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/public`
    );

    if (!response.ok) return null;

    return response.json();
  } catch (error) {
    return null;
  }
}