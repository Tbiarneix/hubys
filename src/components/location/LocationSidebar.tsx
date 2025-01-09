import { Location, LocationSettings, Subgroup } from "@/types/location";

interface LocationSidebarProps {
  settings: LocationSettings;
  onSettingsChange: (settings: LocationSettings) => void;
  selectedLocation: Location | null;
  subgroups: Subgroup[];
  eventId: string;
}

export function LocationSidebar({ settings, onSettingsChange, selectedLocation, subgroups, eventId }: LocationSidebarProps) {
  const calculateSubgroupAmount = (subgroup: Subgroup) => {
    if (!selectedLocation) return 0;
    
    const totalShares = 
      subgroup.adults.length * settings.adultShare +
      subgroup.children.length * settings.childShare;
    
    const totalGroupShares = subgroups.reduce((sum, group) => 
      sum + group.adults.length * settings.adultShare +
      group.children.length * settings.childShare, 0);
    
    return (selectedLocation.amount * totalShares) / totalGroupShares;
  };

  const handleSettingsChange = async (newSettings: LocationSettings) => {
    try {
      const response = await fetch(`/api/events/${eventId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adultShare: newSettings.adultShare,
          childShare: newSettings.childShare,
        }),
      });

      if (!response.ok) throw new Error('Failed to update settings');
      
      onSettingsChange(newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  return (
    <div className="w-80 border-l bg-white fixed top-0 right-0 bottom-10 pb-4 overflow-y-auto">
      <div className="p-4 space-y-6">
        <div>
          <h3 className="font-medium mb-4 text-gray-900">Paramètres</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Parts par adulte
              </label>
              <input
                type="number"
                value={settings.adultShare}
                onChange={(e) => handleSettingsChange({
                  ...settings,
                  adultShare: parseFloat(e.target.value),
                })}
                min="0"
                step="0.5"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Parts par enfant
              </label>
              <input
                type="number"
                value={settings.childShare}
                onChange={(e) => handleSettingsChange({
                  ...settings,
                  childShare: parseFloat(e.target.value),
                })}
                min="0"
                step="0.5"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-4 text-gray-900">Répartition des coûts</h3>
          
          <div className="space-y-3">
            {subgroups.map((subgroup) => {
              const amount = calculateSubgroupAmount(subgroup);
              return (
                <div
                  key={subgroup.id}
                  className="p-3 rounded-lg border border-gray-200 space-y-2"
                >
                  <div className="flex gap-2 justify-between">
                    {/* Adultes */}
                    <div className="flex gap-2">
                      <div>
                        {subgroup.adults.map((adult, index) => (
                          <div key={adult.id} className="text-sm text-gray-700">
                            {adult.name}
                            {index < subgroup.adults.length - 1 && " & "}
                          </div>
                        ))}
                      </div>

                      {/* Enfants */}
                      {subgroup.children.length > 0 && (
                        <div className="text-sm text-gray-700">
                          + {subgroup.children.length} enfant{subgroup.children.length > 1 ? "s" : ""}
                          <div className="text-sm text-gray-600 pl-2">
                            {subgroup.children.map((child) => child.name).join(", ")}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Montant */}
                    {selectedLocation && (
                      <div className="text-lg font-medium text-gray-900">
                        {amount.toFixed(0)} €
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
