import { HomeIcon } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center justify-center space-x-3">
      <HomeIcon className="w-12 h-12 text-gray-900" aria-hidden="true" />
      <h1 className="text-4xl font-bold text-gray-900">
        Hubidays
      </h1>
    </div>
  );
}