import { Rental } from "@/types/rental";
import {
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { DeleteRentalModal } from "./DeleteRentalModal";

interface RentalCardProps {
  rental: Rental;
  onSelect: (rental: Rental) => void;
  isSelected: boolean;
}

export function RentalCard({
  rental,
  onSelect,
  isSelected,
}: RentalCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const totalPoints = rental.votes.reduce((sum, vote) => sum + vote.value, 0);
  const userVotes = rental.votes.filter(
    (vote) => vote.userId === session?.user?.id
  );

  const handleVote = async (value: number) => {
    try {
      const response = await fetch("/api/rentals/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rentalId: rental.id,
          value,
        }),
      });

      if (!response.ok) throw new Error("Failed to vote");
      router.refresh();
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  return (
    <>
      <div
        className={`flex flex-col justify-between rounded-lg border p-4 transition-all cursor-pointer relative ${
          isSelected
            ? "border-gray-900 ring-2 ring-gray-900"
            : "hover:border-gray-400"
        }`}
        onClick={() => onSelect(rental)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDeleteModalOpen(true);
          }}
          className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="flex justify-between mb-4">
          <div className="relative w-24 h-24">
            <Image
              src={rental.image}
              alt={rental.title}
              fill
              className="object-cover rounded"
            />
          </div>
          <h3 className="font-medium text-gray-800 w-1/2">{rental.title}</h3>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              className={`p-2 rounded-lg transition-colors ${
                userVotes.some((v) => v.value === 1)
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleVote(1);
              }}
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <span className="font-medium text-gray-700">{totalPoints}</span>
            <button
              className={`p-2 rounded-lg transition-colors ${
                userVotes.some((v) => v.value === -1)
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleVote(-1);
              }}
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
          <p className="text-m text-gray-700 mt-1">{rental.amount} €</p>
          <button
            className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              window.open(rental.url, "_blank");
            }}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Voir
          </button>
        </div>
      </div>

      <DeleteRentalModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        rentalId={rental.id}
        title={rental.title}
      />
    </>
  );
}
