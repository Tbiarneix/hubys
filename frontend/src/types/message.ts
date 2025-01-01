export interface Message {
  id: string;
  content: string;
  user: {
    id: string;
    firstName: string;
    lastName?: string;
    avatar?: string;
  };
  createdAt: Date;
}