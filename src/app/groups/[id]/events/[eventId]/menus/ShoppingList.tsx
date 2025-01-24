"use client";

import { Fragment, useState, useEffect } from 'react';
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Menu, IngredientType, ShoppingItem } from '@/types/group';
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Dialog, Transition } from "@headlessui/react";

type FilterType = 'menu' | 'date' | 'category';

interface ShoppingListProps {
  menus: Menu[];
  shoppingListId: string;
}

interface ExtendedShoppingItem extends ShoppingItem {
  menuName?: string;
  menuDate?: Date;
  menuType?: string;
  checked: boolean;
}

export function ShoppingList({ menus, shoppingListId }: ShoppingListProps) {
  const params = useParams();
  const [filterType, setFilterType] = useState<FilterType>('category');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    unit: "",
    type: "OTHER",
    menuId: "",
  });
  const [allShoppingItems, setAllShoppingItems] = useState<ExtendedShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les items de la shopping list
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        if (!shoppingListId) {
          setAllShoppingItems([]);
          return;
        }

        const response = await fetch(`/api/groups/${params.id}/events/${params.eventId}/shopping-lists/${shoppingListId}/items`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des items');
        }

        const items = await response.json();
        setAllShoppingItems(items.map((item: ShoppingItem) => ({
          ...item,
          menuName: menus.find((menu) => menu.id === item.menuId)?.name,
          menuDate: item.menuId
            ? menus.find((menu) => menu.id === item.menuId)?.date
              ? new Date(menus.find((menu) => menu.id === item.menuId)!.date)
              : undefined
            : undefined,
          menuType: item.menuId
            ? menus.find((menu) => menu.id === item.menuId)?.type
            : undefined,
          checked: item.checked
        })));
      } catch (error) {
        console.error(error);
        toast.error("Impossible de récupérer les items");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [shoppingListId, params.id, params.eventId, menus]);

  // Fonction pour grouper les items selon le filtre sélectionné
  const groupItems = () => {
    switch (filterType) {
      case 'menu':
        return allShoppingItems.reduce((groups, item) => {
          const key = item.menuName ? `${item.menuName} (${item.menuDate ? format(item.menuDate, "EEE d", { locale: fr }) : 'Sans date'} - ${item.menuType === 'lunch' ? 'Déjeuner' : 'Dîner'})` : 'Sans menu';
          return {
            ...groups,
            [key]: [...(groups[key] || []), item]
          };
        }, {} as Record<string, typeof allShoppingItems>);

      case 'date':
        return allShoppingItems.reduce((groups, item) => {
          const key = item.menuDate ? format(item.menuDate, "EEEE d MMMM", { locale: fr }) : 'Sans date';
          return {
            ...groups,
            [key]: [...(groups[key] || []), item]
          };
        }, {} as Record<string, typeof allShoppingItems>);

      case 'category':
        return allShoppingItems.reduce((groups, item) => {
          const categoryLabels: Record<IngredientType, string> = {
            VEGETABLE: 'Légumes',
            FRUIT: 'Fruits',
            MEAT: 'Viande',
            FISH: 'Poisson',
            DAIRY: 'Produits laitiers',
            GROCERY: 'Épicerie',
            BAKERY: 'Boulangerie',
            BEVERAGE: 'Boissons',
            CONDIMENT: 'Condiments',
            OTHER: 'Sans catégorie'
          };
          const key = categoryLabels[item.type];
          return {
            ...groups,
            [key]: [...(groups[key] || []), item]
          };
        }, {} as Record<string, typeof allShoppingItems>);

      default:
        return {};
    }
  };

  // Fonction pour ajouter un nouvel item
  const handleAddItem = async () => {
    try {
      // Vérifier que le nom est renseigné
      if (!newItem.name) {
        toast.error("Le nom est obligatoire");
        return;
      }

      // Appel à l'API pour créer l'item
      const response = await fetch(`/api/groups/${params.id}/events/${params.eventId}/shopping-lists/${shoppingListId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newItem.name,
          quantity: newItem.quantity ? parseFloat(newItem.quantity) : null,
          unit: newItem.unit || null,
          type: newItem.type || 'OTHER',
          menuId: newItem.menuId || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'item');
      }

      const createdItem = await response.json();

      // Mettre à jour l'état local avec le nouvel item
      setAllShoppingItems(prevItems => [
        ...prevItems,
        {
          ...createdItem,
          checked: false,
          menuName: menus.find((menu) => menu.id === createdItem.menuId)?.name,
          menuDate: createdItem.menuId
            ? menus.find((menu) => menu.id === createdItem.menuId)?.date
              ? new Date(menus.find((menu) => menu.id === createdItem.menuId)!.date)
              : undefined
            : undefined,
          menuType: createdItem.menuId
            ? menus.find((menu) => menu.id === createdItem.menuId)?.type
            : undefined,
        },
      ]);

      // Réinitialiser le formulaire et fermer le modal
      setNewItem({
        name: '',
        quantity: '',
        unit: '',
        type: 'OTHER',
        menuId: '',
      });
      setIsAddModalOpen(false);

      toast.success('Item ajouté avec succès');
    } catch (error) {
      console.error(error);
      toast.error("Impossible d'ajouter l'item");
    }
  };

  // Fonction pour gérer le changement d'état d'un item
  const handleToggleItem = async (itemId: string) => {
    try {
      if (!shoppingListId) {
        toast.error("Aucune liste de courses n'est disponible");
        return;
      }

      const response = await fetch(`/api/groups/${params.id}/events/${params.eventId}/shopping-lists/${shoppingListId}/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checked: !allShoppingItems.find(item => item.id === itemId)?.checked
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de l\'item');
      }

      const updatedItem = await response.json();

      // Mettre à jour l'état local
      setAllShoppingItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId 
            ? { ...item, checked: updatedItem.checked }
            : item
        )
      );
    } catch (error) {
      console.error(error);
      toast.error("Impossible de mettre à jour l'item");
    }
  };

  const groupedItems = groupItems();

  // Fonction pour formater l'unité
  const formatUnit = (unit: string | null | undefined) => {
    const unitLabels: Record<string, string> = {
      NONE: '',
      GRAM: 'g',
      KILOGRAM: 'kg',
      MILLILITER: 'ml',
      CENTILITER: 'cl',
      LITER: 'L',
      SPOON: 'cuillère(s)',
      BUNCH: 'botte(s)',
      PACK: 'paquet(s)',
    };
    return unit ? unitLabels[unit] || unit : '';
  };

  return (
    <div className="space-y-4 bg-gray-50 rounded-lg shadow-sm border p-6 mt-8 mb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Liste de courses
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('menu')}
            className={cn(
              "px-3 py-1 text-sm rounded-md",
              filterType === 'menu'
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            )}
          >
            Par menu
          </button>
          <button
            onClick={() => setFilterType('date')}
            className={cn(
              "px-3 py-1 text-sm rounded-md",
              filterType === 'date'
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            )}
          >
            Par jour
          </button>
          <button
            onClick={() => setFilterType('category')}
            className={cn(
              "px-3 py-1 text-sm rounded-md",
              filterType === 'category'
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            )}
          >
            Par catégorie
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1 text-sm rounded-md bg-gray-900 text-white hover:bg-gray-800"
          >
            Ajouter un item
          </button>
        </div>
      </div>

      {/* Modal d'ajout d'item */}
      <Transition appear show={isAddModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsAddModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Ajouter un item
                  </Dialog.Title>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                        value={newItem.name}
                        onChange={(e) =>
                          setNewItem({ ...newItem, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                        Quantité
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                        value={newItem.quantity}
                        onChange={(e) =>
                          setNewItem({ ...newItem, quantity: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                        Unité
                      </label>
                      <select
                        id="unit"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                        value={newItem.unit}
                        onChange={(e) =>
                          setNewItem({ ...newItem, unit: e.target.value })
                        }
                      >
                        <option value="">Choisir une unité</option>
                        <option value="NONE">-</option>
                        <option value="GRAM">Grammes</option>
                        <option value="KILOGRAM">Kilogrammes</option>
                        <option value="MILLILITER">Millilitres</option>
                        <option value="CENTILITER">Centilitres</option>
                        <option value="LITER">Litres</option>
                        <option value="SPOON">Cuillères</option>
                        <option value="BUNCH">Bouquets</option>
                        <option value="PACK">Paquets</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        id="type"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                        value={newItem.type}
                        onChange={(e) =>
                          setNewItem({ ...newItem, type: e.target.value })
                        }
                      >
                        <option value="VEGETABLE">Légumes</option>
                        <option value="FRUIT">Fruits</option>
                        <option value="MEAT">Viande</option>
                        <option value="FISH">Poisson</option>
                        <option value="DAIRY">Produits laitiers</option>
                        <option value="GROCERY">Épicerie</option>
                        <option value="BAKERY">Boulangerie</option>
                        <option value="BEVERAGE">Boissons</option>
                        <option value="CONDIMENT">Condiments</option>
                        <option value="OTHER">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="menu" className="block text-sm font-medium text-gray-700 mb-1">
                        Menu (optionnel)
                      </label>
                      <select
                        id="menu"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                        value={newItem.menuId}
                        onChange={(e) =>
                          setNewItem({ ...newItem, menuId: e.target.value })
                        }
                      >
                        <option value="">Aucun menu</option>
                        {menus.map((menu) => (
                          <option key={menu.id} value={menu.id}>
                            {menu.name} ({format(new Date(menu.date), "EEE d", { locale: fr })} - {menu.type === 'lunch' ? 'Déjeuner' : 'Dîner'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="px-3 py-1 text-sm rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      onClick={() => setIsAddModalOpen(false)}
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 text-sm rounded-md bg-gray-900 text-white hover:bg-gray-800"
                      onClick={handleAddItem}
                    >
                      Ajouter
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {isLoading ? (
        <div className="text-gray-500 text-center">Chargement...</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([groupName, items]) => (
            <div key={groupName} className="space-y-2">
              <h3 className="font-medium text-gray-900">{groupName}</h3>
              <div className="bg-white rounded-md border border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <li key={`${item.id}-${index}`} className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <button
                          onClick={() => handleToggleItem(item.id)}
                          className={cn(
                            "flex items-center justify-center w-5 h-5 border rounded",
                            item.checked 
                              ? "bg-green-500 border-green-500 text-white" 
                              : "border-gray-300 hover:border-gray-400"
                          )}
                        >
                          {item.checked && <Check className="w-4 h-4" />}
                        </button>
                        <div className="flex gap-3 items-center">
                          <p className={cn(
                            "text-gray-900",
                            item.checked && "line-through text-gray-500"
                          )}>{item.name}</p>
                          {filterType !== 'menu' && item.menuName && (
                            <span className="text-sm text-gray-500">
                              {item.menuName} ({item.menuDate ? format(item.menuDate, "EEE d", { locale: fr }) : 'Sans date'} - {item.menuType === 'lunch' ? 'Déjeuner' : 'Dîner'})
                            </span>
                          )}
                        </div>
                      </div>
                      {item.quantity && (
                        <div className={cn(
                          "text-gray-700",
                          item.checked && "line-through text-gray-500"
                        )}>
                          {item.quantity} {formatUnit(item.unit)}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
