import { useState } from 'react';
import { Check } from 'lucide-react';
import { toggleItemSelection } from '../../lib/services/wishlistService';

interface ItemSelectionProps {
  itemId: string;
  isSelected: boolean;
  selectorName?: string;
  onUpdate: () => void;
}

export function ItemSelection({ 
  itemId, 
  isSelected, 
  selectorName,
  onUpdate 
}: ItemSelectionProps) {
  const [name, setName] = useState(selectorName || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleToggle = async () => {
    if (!isSelected && !name.trim()) {
      setIsEditing(true);
      return;
    }
    
    await toggleItemSelection(itemId, !isSelected, isSelected ? undefined : name);
    onUpdate();
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    await toggleItemSelection(itemId, true, name);
    onUpdate();
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Votre nom"
          className="px-2 py-1 text-sm border rounded"
          autoFocus
        />
        <button
          type="submit"
          className="px-3 py-1 text-sm text-white bg-gray-900 rounded hover:bg-gray-800"
        >
          OK
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {isSelected && selectorName && (
        <span className="text-sm text-gray-500">
          Choisi par {selectorName}
        </span>
      )}
      <button
        onClick={handleToggle}
        className={`w-6 h-6 rounded border ${
          isSelected 
            ? 'bg-gray-900 border-gray-900 text-white' 
            : 'border-gray-300 hover:border-gray-400'
        } flex items-center justify-center transition-colors`}
        aria-label={isSelected ? "Désélectionner" : "Sélectionner"}
      >
        {isSelected && <Check className="h-4 w-4" />}
      </button>
    </div>
  );
}