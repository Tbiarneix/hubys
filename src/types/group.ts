export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  joinedAt: string;
  role: string;
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  email: string | null;
  token: string;
  expiresAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  userId: string;
  content: string;
  createdAt: string;
  isDeleted: boolean;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export interface SecretSanta {
  id: string;
  year: number;
  groupId: string;
  createdAt: string;
  assignments: SecretSantaAssignment[];
}

export interface SecretSantaAssignment {
  id: string;
  secretSantaId: string;
  giverId: string;
  receiverId: string;
  createdAt: string;
  receiver: {
    id: string;
    name: string;
  };
}

export type Unit = 'NONE' | 'GRAM' | 'KILOGRAM' | 'MILLILITER' | 'CENTILITER' | 'LITER' | 'SPOON' | 'BUNCH' | 'PACK';

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: Unit | null;
  type: IngredientType;
  recipeId: string;
  createdAt: string;
  updatedAt: string;
}

export type RecipeCategory = 'STARTER' | 'MAIN' | 'DESSERT' | 'SIDE' | 'BREAKFAST' | 'SNACK' | 'DRINK' | 'OTHER';

export interface RecipeFavorite {
  id: string;
  userId: string;
  recipeId: string;
  createdAt: string;
}

export interface Recipe {
  id: string;
  name: string;
  url: string | null;
  description: string | null;
  servings: number;
  steps: string[];
  groupId: string;
  authorId: string;
  category: RecipeCategory;
  createdAt: string;
  updatedAt: string;
  ingredients: Ingredient[];
  favorites: RecipeFavorite[];
  author: {
    id: string;
    name: string;
  };
}

export type MealType = 'lunch' | 'dinner';

export type IngredientType = 'VEGETABLE' | 'FRUIT' | 'MEAT' | 'FISH' | 'DAIRY' | 'GROCERY' | 'BAKERY' | 'BEVERAGE' | 'CONDIMENT' | 'OTHER';

export interface ShoppingItem {
  id: string;
  menuId: string;
  name: string;
  quantity?: number;
  unit?: Unit;
  type: IngredientType;
  createdAt: string;
  updatedAt: string;
}

export interface Menu {
  id: string;
  eventId: string;
  date: string;
  type: MealType;
  numberOfPeople: number;
  name: string;
  recipeId?: string;
  url?: string;
  userId: string;
  recipe?: Recipe;
  user: {
    id: string;
    name: string;
  };
  shoppingItems: ShoppingItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Subgroup {
  id: string;
  eventId: string;
  activeAdults: string[];
  activeChildren: string[];
}

export interface SubgroupPresence {
  id: string;
  subgroupId: string;
  userId: string;
  date: string;
  isPresent: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export interface Event {
  id: string;
  name: string;
  groupId: string;
  startDate: string;
  endDate: string;
  hasLocation: boolean;
  hasCalendar: boolean;
  hasMenus: boolean;
  hasShopping: boolean;
  hasActivities: boolean;
  hasPhotos: boolean;
  hasAccounts: boolean;
  adultShare: number;
  childShare: number;
  createdAt: string;
  updatedAt: string;
  locations?: Location[];
  subgroups?: Subgroup[];
  presences?: SubgroupPresence[];
  menus?: Menu[];
}

export interface Group {
  id: string;
  name: string;
  createdAt: string;
  showEvents: boolean;
  showSecretSanta: boolean;
  showRecipes: boolean;
  showCalendar: boolean;
  members: GroupMember[];
  invitations: GroupInvitation[];
  messages: GroupMessage[];
  deletionVotes: string[];
  secretSantas?: SecretSanta[];
  events?: Event[];
  recipes: Recipe[];
}
