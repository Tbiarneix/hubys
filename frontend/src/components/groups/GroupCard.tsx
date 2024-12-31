import { FC } from 'react';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { Group } from '@/types/group';

interface GroupCardProps {
  group: Group;
}

export const GroupCard: FC<GroupCardProps> = ({ group }) => {
  return (
    <Link href={`/groups/${group.id}`}>
      <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">{group.name}</h3>
          <div className="flex items-center text-gray-600">
            <Users className="w-5 h-5 mr-2" />
            <span>{group.members.length} membres</span>
          </div>
        </div>
        <div className="flex -space-x-2 overflow-hidden">
          {group.members.slice(0, 5).map((member) => (
            <img
              key={member.id}
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
              src={member.user.avatar || `https://ui-avatars.com/api/?name=${member.user.firstName}+${member.user.lastName}`}
              alt={`${member.user.firstName} ${member.user.lastName}`}
            />
          ))}
          {group.members.length > 5 && (
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 ring-2 ring-white">
              <span className="text-xs font-medium">
                +{group.members.length - 5}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};