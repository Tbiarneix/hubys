export interface Location {
  id: string;
  eventId: string;
  url: string;
  amount: number;
  title: string;
  image: string;
  createdAt: Date;
  createdBy: string;
  votes: LocationVote[];
}

export interface LocationVote {
  id: string;
  locationId: string;
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

export interface LocationSettings {
  adultShare: number;
  childShare: number;
  maxVotesPerUser: number | null; // null means unlimited
}
