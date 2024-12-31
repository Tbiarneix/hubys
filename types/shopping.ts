export interface ShoppingItem {
  id: string;
  name: string;
  quantity?: string;
  category: string;
  checked: boolean;
  mealId?: string;
  eventId: string;
}