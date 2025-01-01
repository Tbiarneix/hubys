export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName?: string;
    avatar?: string;
    children: Child[]
  }
  
  export interface Child {
    id: string;
    name: string;
    birthDate: Date;
    parentId: string;
  }