'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { RecipeCategory } from '@/types/group';

interface RecipeFiltersProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: RecipeCategory | 'ALL') => void;
}

const CATEGORIES: { value: RecipeCategory | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Toutes les recettes' },
  { value: 'STARTER', label: 'Entrées' },
  { value: 'MAIN', label: 'Plats principaux' },
  { value: 'DESSERT', label: 'Desserts' },
  { value: 'SIDE', label: 'Accompagnements' },
  { value: 'BREAKFAST', label: 'Petit-déjeuner' },
  { value: 'SNACK', label: 'En-cas' },
  { value: 'DRINK', label: 'Boissons' },
  { value: 'OTHER', label: 'Autres' },
];

export default function RecipeFilters({ onSearch, onCategoryChange }: RecipeFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | 'ALL'>('ALL');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value as RecipeCategory | 'ALL';
    setSelectedCategory(category);
    onCategoryChange(category);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="Rechercher une recette..."
          value={searchQuery}
          onChange={handleSearch}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
        />
      </div>
      <select
        value={selectedCategory}
        onChange={handleCategoryChange}
        className="block w-full sm:w-48 px-3 py-2 border border-gray-300 bg-white rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
      >
        {CATEGORIES.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </select>
    </div>
  );
}
