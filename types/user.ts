export interface Child {
  id: string;
  name: string;
  birthDate: Date;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  birthDate?: Date;
  bio?: string;
  avatar?: string;
  partner?: User;
  children: Child[];
}