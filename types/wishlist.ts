export interface WishlistItem {
  id: string;
  name: string;
  link?: string;
  category?: string;
  isReserved: boolean;
  reservedByName?: string;
  order: number;
  createdAt: Date;
}