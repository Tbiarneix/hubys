import { notFound } from "next/navigation";
import { PublicWishlist } from "@/components/wishlist/PublicWishlist";
import { getPublicUser } from "@/lib/api/users";

interface PublicWishlistPageProps {
  params: {
    userId: string;
  };
}

export default async function PublicWishlistPage({ params }: PublicWishlistPageProps) {
  const user = await getPublicUser(params.userId);
  
  if (!user) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">
          Liste de souhaits de {user.firstName} {user.lastName}
        </h1>
      </div>
      
      <PublicWishlist userId={params.userId} />
    </div>
  );
}