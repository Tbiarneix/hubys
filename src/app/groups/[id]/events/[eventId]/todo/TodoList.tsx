"use client";

import { Fragment, useState, useEffect } from "react";
import { TodoItem } from "@/types/group";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Dialog, Transition } from "@headlessui/react";
import { Check, Pencil, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TodoListProps {
  activeAdults: Array<{ id: string; name: string | null }>;
}

export function TodoList({ activeAdults }: TodoListProps) {
  const params = useParams();
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TodoItem | null>(null);
  const [newItem, setNewItem] = useState({
    title: "",
    assignedToId: "",
  });

  // Charger les items de la todo liste
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/groups/${params.id}/events/${params.eventId}/todo`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des items");
        }
        const items = await response.json();
        setTodoItems(items);
      } catch (error) {
        console.error(error);
        toast.error("Impossible de récupérer les items");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [params.id, params.eventId]);

  const handleAddItem = async () => {
    try {
      if (!newItem.title.trim()) {
        toast.error("Le titre est requis");
        return;
      }

      const response = await fetch(`/api/groups/${params.id}/events/${params.eventId}/todo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de l'item");
      }

      const item = await response.json();
      setTodoItems([item, ...todoItems]);
      setIsAddModalOpen(false);
      setNewItem({ title: "", assignedToId: "" });
      toast.success("Tâche ajoutée avec succès");
    } catch (error) {
      console.error(error);
      toast.error("Impossible d'ajouter la tâche");
    }
  };

  const handleUpdateItem = async (item: TodoItem, updates: Partial<TodoItem>) => {
    try {
      const response = await fetch(
        `/api/groups/${params.id}/events/${params.eventId}/todo/${item.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de l'item");
      }

      const updatedItem = await response.json();
      setTodoItems(
        todoItems.map((i) => (i.id === updatedItem.id ? updatedItem : i))
      );
      setIsEditModalOpen(false);
      setEditingItem(null);
      toast.success("Tâche mise à jour avec succès");
    } catch (error) {
      console.error(error);
      toast.error("Impossible de mettre à jour la tâche");
    }
  };

  const handleDeleteItem = async (item: TodoItem) => {
    try {
      const response = await fetch(
        `/api/groups/${params.id}/events/${params.eventId}/todo/${item.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'item");
      }

      setTodoItems(todoItems.filter((i) => i.id !== item.id));
      setIsDeleteModalOpen(false);
      setEditingItem(null);
      toast.success("Tâche supprimée avec succès");
    } catch (error) {
      console.error(error);
      toast.error("Impossible de supprimer la tâche");
    }
  };

  // Grouper les items par assignation
  const groupedItems = todoItems.reduce((groups, item) => {
    const key = item.assignedTo?.name || "Non assigné";
    return {
      ...groups,
      [key]: [...(groups[key] || []), item],
    };
  }, {} as Record<string, TodoItem[]>);

  return (
    <div className="mt-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">A faire</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          Ajouter une tâche
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Chargement...</div>
      ) : (
        Object.entries(groupedItems).map(([assignee, items]) => (
          <div key={assignee} className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{assignee}</h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleUpdateItem(item, { completed: !item.completed })}
                      className={cn(
                        "flex items-center justify-center w-5 h-5 rounded border",
                        item.completed
                          ? "bg-gray-900 border-gray-900 text-white"
                          : "border-gray-300"
                      )}
                    >
                      {item.completed && <Check className="w-3 h-3" />}
                    </button>
                    <span
                      className={cn(
                        "text-gray-900",
                        item.completed && "line-through text-gray-500"
                      )}
                    >
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1 text-gray-500 hover:text-gray-900"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1 text-gray-500 hover:text-gray-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Modal d'ajout */}
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
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium text-gray-900 mb-4"
                  >
                    Ajouter une tâche
                  </Dialog.Title>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Titre
                      </label>
                      <input
                        type="text"
                        value={newItem.title}
                        onChange={(e) =>
                          setNewItem({ ...newItem, title: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Titre de la tâche"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assigné à
                      </label>
                      <select
                        value={newItem.assignedToId}
                        onChange={(e) =>
                          setNewItem({ ...newItem, assignedToId: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Non assigné</option>
                        {activeAdults.map((adult) => (
                          <option key={adult.id} value={adult.id}>
                            {adult.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
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

      {/* Modal de modification */}
      <Transition appear show={isEditModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsEditModalOpen(false)}
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
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium text-gray-900 mb-4"
                  >
                    Modifier la tâche
                  </Dialog.Title>
                  {editingItem && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Titre
                        </label>
                        <input
                          type="text"
                          value={editingItem.title}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              title: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Assigné à
                        </label>
                        <select
                          value={editingItem.assignedToId || ""}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              assignedToId: e.target.value || null,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Non assigné</option>
                          {activeAdults.map((adult) => (
                            <option key={adult.id} value={adult.id}>
                              {adult.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => editingItem && handleUpdateItem(editingItem, editingItem)}
                      className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
                    >
                      Enregistrer
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal de suppression */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsDeleteModalOpen(false)}
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
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium text-gray-900 mb-4"
                  >
                    Supprimer la tâche
                  </Dialog.Title>
                  <p className="text-gray-500">
                    Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.
                  </p>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => editingItem && handleDeleteItem(editingItem)}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
