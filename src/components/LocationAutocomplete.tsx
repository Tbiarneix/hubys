import { useEffect, useState } from 'react';
import { OpenStreetMapProvider } from 'leaflet-geosearch';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function LocationAutocomplete({ value, onChange, className }: LocationAutocompleteProps) {
  const [search, setSearch] = useState(value);
  const [suggestions, setSuggestions] = useState<Array<{ label: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const provider = new OpenStreetMapProvider({
    params: {
      'accept-language': 'fr',
      countrycodes: 'fr',
      addressdetails: 1,
      limit: 5,
    },
  });

  useEffect(() => {
    setSearch(value);
  }, [value]);

  const handleSearch = async (searchText: string) => {
    setSearch(searchText);
    if (searchText.length > 2) {
      try {
        const results = await provider.search({ query: searchText });
        setSuggestions(
          results.map((result) => ({
            label: result.label,
          }))
        );
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error searching location:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (suggestion: string) => {
    setSearch(suggestion);
    onChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        placeholder="Entrez une adresse ou une ville"
        className={className}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(suggestion.label)}
            >
              {suggestion.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
