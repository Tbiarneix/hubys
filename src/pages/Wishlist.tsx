import { User } from '@supabase/supabase-js';
import { WishlistSection } from '../components/wishlist/WishlistSection';

interface WishlistProps {
  user: User;
}

export function Wishlist({ user }: WishlistProps) {
  return <WishlistSection user={user} ownerId={user.id} />;
}