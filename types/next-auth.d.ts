import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string | null;
      name?: string | null;
      image?: string | null;
    };
    accessToken: string;
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
    accessToken: string;
  }
}
