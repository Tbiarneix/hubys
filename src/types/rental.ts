export interface Rental {
  id: string;
  eventId: string;
  url: string;
  amount: number;
  title: string;
  image: string;
  createdAt: Date;
  createdBy: string;
  votes: RentalVote[];
}

export interface RentalVote {
  id: string;
  rentalId: string;
  userId: string;
  value: number; // 1 or -1
  createdAt: Date;
}

export interface Subgroup {
  id: string;
  adults: {
    id: string;
    name: string;
  }[];
  children: {
    id: string;
    name: string;
  }[];
}

export interface RentalSettings {
  adultShare: number;
  childShare: number;
}
