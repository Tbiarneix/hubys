export interface Activity {
  id: string;
  title: string;
  link?: string;
  location?: string;
  priceAdult?: number;
  priceChild?: number;
  priceBaby?: number;
  date: Date;
  eventId: string;
}