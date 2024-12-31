export interface User {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidByUser: User;
  sharedWithUsers: User[];
  eventId: string;
  createdAt: string;
}

export interface Balance {
  from: User;
  to: User;
  amount: number;
}