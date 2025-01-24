"use client";

import { format, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AddMealModal } from "./AddMealModal";
import { UpdateMealModal } from "./UpdateMealModal";
import { Recipe, MealType, Menu, Subgroup } from "@/types/group";
import { Plus, ExternalLink, Ban } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SubgroupPresence } from "@prisma/client";
import { ShoppingList } from "./ShoppingList";

interface MenuCalendarProps {
  startDate: Date;
  endDate: Date;
  recipes: Recipe[];
  menus: Menu[];
  subgroups: Subgroup[];
  presences: SubgroupPresence[];
  groupMembers: {
    user: {
      id: string;
      name: string;
    };
  }[];
  shoppingListId: string;
}

export default function MenuCalendar({
  startDate,
  endDate,
  recipes,
  menus,
  subgroups,
  presences,
  groupMembers,
  shoppingListId,
}: MenuCalendarProps) {
  const params = useParams();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(
    null
  );
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  const [isUpdateMealModalOpen, setIsUpdateMealModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  const handleCellClick = (date: Date, type: MealType) => {
    const menu = getMenu(date, type);
    if (menu) {
      setSelectedMenu(menu);
      setIsUpdateMealModalOpen(true);
    } else if (
      getNumberOfPeople(date, type === "lunch" ? "lunch" : "dinner") > 0
    ) {
      setSelectedDate(date);
      setSelectedMealType(type);
      setIsAddMealModalOpen(true);
    }
  };

  const handleAddModalClose = () => {
    setIsAddMealModalOpen(false);
    setSelectedDate(null);
    setSelectedMealType(null);
  };

  const handleUpdateModalClose = () => {
    setIsUpdateMealModalOpen(false);
    setSelectedMenu(null);
  };

  // Fonction pour obtenir le menu d'un jour et type donnés
  const getMenu = (date: Date, type: MealType) => {
    return menus.find((menu) => {
      const menuDate = new Date(menu.date);
      return (
        menuDate.getFullYear() === date.getFullYear() &&
        menuDate.getMonth() === date.getMonth() &&
        menuDate.getDate() === date.getDate() &&
        menu.type === type
      );
    });
  };

  // Fonction pour obtenir les noms des adultes actifs d'un sous-groupe
  const getActiveAdultsNames = (userId: string) => {
    // Trouver le sous-groupe qui contient l'utilisateur
    const subgroup = subgroups.find((subgroup) =>
      subgroup.activeAdults.includes(userId)
    );

    if (!subgroup) return "Inconnu";

    // Récupérer les noms des adultes actifs
    const adultNames = subgroup.activeAdults
      .map((adultId) => {
        const member = groupMembers.find((m) => m.user.id === adultId);
        return member?.user.name || "Inconnu";
      })
      .join(" & ");

    return adultNames || "Inconnu";
  };

  const days = eachDayOfInterval({
    start: new Date(startDate),
    end: new Date(endDate),
  });

  const getNumberOfPeople = (date: Date, type: "lunch" | "dinner") => {
    return subgroups.reduce((total, subgroup) => {
      const presence = presences.find(
        (p) =>
          p.subgroupId === subgroup.id &&
          new Date(p.date).toDateString() === date.toDateString()
      );
      return (
        total +
        (presence
          ? type === "lunch"
            ? presence.lunchNumber
            : presence.dinnerNumber
          : 0)
      );
    }, 0);
  };

  return (
    <>
      <div className="space-y-4 bg-gray-50 rounded-lg shadow-sm border p-6 mt-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Menus</h2>
          </div>
          <div className="grid grid-cols-[auto,1fr]">
            <div>
              {/* Labels de gauche */}
              <div className="h-12" /> {/* Espace pour l'en-tête des dates */}
              <div className="flex justify-between">
                <div className="h-48 px-2 w-full flex flex-col justify-center text-sm font-medium bg-white text-gray-700 border relative">
                  <p>Repas</p>
                </div>
                <div>
                  <div
                    className={cn(
                      "h-24 px-2 border flex items-center justify-center bg-white text-gray-700"
                    )}
                  >
                  Déjeuner
                </div>
                  <div
                    className={cn(
                      "h-24 px-2 border flex items-center justify-center bg-white text-gray-700"
                    )}
                  >
                  Dîner
                </div>
              </div>
            </div>
            </div>
            <div className="overflow-x-auto">
              <div
                className="grid"
                style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
              >
                {/* En-tête avec les dates */}
                {days.map((day, index) => (
                  <div
                    key={`${day.toISOString()}-${index}`}
                    className="h-12 px-2 flex items-center justify-center border-b text-sm font-medium text-gray-700"
                  >
                    {format(day, "EEE d", { locale: fr })}
                  </div>
                ))}
                {/* Ligne des déjeuners */}
                {days.map((day, index) => (
                  <div
                    key={`${day.toISOString()}-${index}-lunch`}
                    className={cn(
                      "h-24 border flex items-center justify-between p-1 text-sm",
                      getMenu(day, "lunch")
                        ? "bg-green-100 hover:bg-green-200"
                        : "bg-gray-100",
                      getNumberOfPeople(day, "lunch") > 0 &&
                        !getMenu(day, "lunch")
                        ? "hover:bg-gray-200 cursor-pointer"
                        : ""
                    )}
                    onClick={() => handleCellClick(day, "lunch")}
                  >
                    {getMenu(day, "lunch") ? (
                      <>
                        <div className="flex flex-col justify-center">
                          <span className="font-medium text-gray-600">
                            {getMenu(day, "lunch")?.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getMenu(day, "lunch")?.numberOfPeople} personnes
                          </span>
                          <span className="text-xs text-gray-500 mt-2">
                            {getMenu(day, "lunch")?.user
                              ? getActiveAdultsNames(
                                  getMenu(day, "lunch")!.user.id
                                )
                              : "Inconnu"}
                          </span>
                        </div>
                        {(getMenu(day, "lunch")?.recipe ||
                          getMenu(day, "lunch")?.url) && (
                          <div className="flex-shrink-0">
                            {getMenu(day, "lunch")?.recipe ? (
                              <Link
                                href={`/groups/${params.id}/recipes/${
                                  getMenu(day, "lunch")?.recipe?.id
                                }`}
                                className="text-xs text-gray-600 hover:text-gray-900"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            ) : (
                              getMenu(day, "lunch")?.url && (
                                <a
                                  href={getMenu(day, "lunch")?.url || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-gray-600 hover:text-gray-900"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        {getNumberOfPeople(day, "lunch") > 0 ? (
                          <Plus className="w-6 h-6 text-gray-500" />
                        ) : (
                          <Ban className="w-4 h-4 text-gray-300" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {/* Ligne des dîners */}
                {days.map((day, index) => (
                  <div
                    key={`${day.toISOString()}-${index}-dinner`}
                    className={cn(
                      "h-24 border flex items-center justify-between p-1 text-sm",
                      getMenu(day, "dinner")
                        ? "bg-green-100 hover:bg-green-200"
                        : "bg-gray-100",
                      getNumberOfPeople(day, "dinner") > 0 &&
                        !getMenu(day, "dinner")
                        ? "hover:bg-gray-200 cursor-pointer"
                        : ""
                    )}
                    onClick={() => handleCellClick(day, "dinner")}
                  >
                    {getMenu(day, "dinner") ? (
                      <>
                        <div className="flex flex-col justify-center">
                          <span className="font-medium text-gray-600">
                            {getMenu(day, "dinner")?.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getMenu(day, "dinner")?.numberOfPeople} personnes
                          </span>
                          <span className="text-xs text-gray-500 mt-2">
                            {getMenu(day, "dinner")?.user
                              ? getActiveAdultsNames(
                                  getMenu(day, "dinner")!.user.id
                                )
                              : "Inconnu"}
                          </span>
                        </div>
                        {(getMenu(day, "dinner")?.recipe ||
                          getMenu(day, "dinner")?.url) && (
                          <div className="flex-shrink-0">
                            {getMenu(day, "dinner")?.recipe ? (
                              <Link
                                href={`/groups/${params.id}/recipes/${
                                  getMenu(day, "dinner")?.recipe?.id
                                }`}
                                className="text-xs text-gray-600 hover:text-gray-900"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            ) : (
                              getMenu(day, "dinner")?.url && (
                                <a
                                  href={getMenu(day, "dinner")?.url || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-gray-600 hover:text-gray-900"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        {getNumberOfPeople(day, "dinner") > 0 ? (
                          <Plus className="w-6 h-6 text-gray-500" />
                        ) : (
                          <Ban className="w-4 h-4 text-gray-300" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ShoppingList
        menus={menus}
        shoppingListId={shoppingListId}
      />

      {selectedDate && selectedMealType && (
        <AddMealModal
          shoppingListId={shoppingListId}
          isOpen={isAddMealModalOpen}
          onClose={handleAddModalClose}
          date={selectedDate}
          mealType={selectedMealType}
          recipes={recipes}
          numberOfPeople={getNumberOfPeople(
            selectedDate,
            selectedMealType === "lunch" ? "lunch" : "dinner"
          )}
          onAdd={async () => {
            handleAddModalClose();
            const response = await fetch(
              `/api/groups/${params.id}/events/${params.eventId}/menus`
            );
            if (response.ok) {
              window.location.href = window.location.href;
            }
          }}
        />
      )}

      {selectedMenu && (
        <UpdateMealModal
          isOpen={isUpdateMealModalOpen}
          onClose={handleUpdateModalClose}
          menu={selectedMenu}
          recipes={recipes}
          onUpdate={async () => {
            handleUpdateModalClose();
            const response = await fetch(
              `/api/groups/${params.id}/events/${params.eventId}/menus`
            );
            if (response.ok) {
              window.location.href = window.location.href;
            }
          }}
        />
      )}
    </>
  );
}
