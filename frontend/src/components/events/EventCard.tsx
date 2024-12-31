import { FC } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface EventCardProps {
  event: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    participants: Array<{ user: { firstName: string; lastName: string } }>;
  };
}

export const EventCard: FC<EventCardProps> = ({ event }) => {
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-semibold mb-4">{event.name}</h3>
        
        <div className="flex items-center gap-2 text-muted-foreground mb-3">
          <Calendar className="w-4 h-4" />
          <span>
            {format(new Date(event.startDate), 'dd MMMM yyyy', { locale: fr })} - 
            {format(new Date(event.endDate), 'dd MMMM yyyy', { locale: fr })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{event.participants.length} participants</span>
        </div>
      </Card>
    </Link>
  );
};