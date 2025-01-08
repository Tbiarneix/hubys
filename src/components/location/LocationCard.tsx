import { Location } from "@/types/location";
import { ArrowUpCircle, ArrowDownCircle, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface LocationCardProps {
  location: Location;
  maxVotesPerUser: number | null;
  onSelect: (location: Location) => void;
  isSelected: boolean;
}

export function LocationCard({ location, maxVotesPerUser, onSelect, isSelected }: LocationCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  
  const totalPoints = location.votes.reduce((sum, vote) => sum + vote.value, 0);
  const userVotes = location.votes.filter(vote => vote.userId === session?.user?.id);
  const canVote = !maxVotesPerUser || userVotes.length < maxVotesPerUser;

  const handleVote = async (value: number) => {
    if (!canVote) return;

    try {
      const response = await fetch('/api/locations/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationId: location.id,
          value,
        }),
      });

      if (!response.ok) throw new Error('Failed to vote');
      router.refresh();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  return (
    <div 
      className={`rounded-lg border p-4 transition-all cursor-pointer ${
        isSelected ? 'border-gray-900 ring-2 ring-gray-900' : 'hover:border-gray-400'
      }`}
      onClick={() => onSelect(location)}
    >
      <div className="flex gap-4">
        <div className="relative w-24 h-24">
          <Image
            src={location.image}
            alt={location.title}
            fill
            className="object-cover rounded"
          />
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-gray-800">{location.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{location.amount} €</p>
          
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <button
                className={`p-2 rounded-lg transition-colors ${
                  userVotes.some(v => v.value === 1)
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${!canVote && 'opacity-50 cursor-not-allowed'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote(1);
                }}
                disabled={!canVote}
              >
                <ArrowUpCircle className="w-4 h-4" />
              </button>
              <span className="font-medium">{totalPoints}</span>
              <button
                className={`p-2 rounded-lg transition-colors ${
                  userVotes.some(v => v.value === -1)
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${!canVote && 'opacity-50 cursor-not-allowed'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote(-1);
                }}
                disabled={!canVote}
              >
                <ArrowDownCircle className="w-4 h-4" />
              </button>
            </div>

            <button
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                window.open(location.url, '_blank');
              }}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Voir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
