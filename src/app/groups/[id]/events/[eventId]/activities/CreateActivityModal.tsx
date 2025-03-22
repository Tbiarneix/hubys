/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { format, eachDayOfInterval } from 'date-fns';

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: () => void;
  startDate: Date;
  endDate: Date;
}

type PriceType = 'unique' | 'differentiated';
type TimeOfDay = 'morning' | 'afternoon' | 'fullday';

export function CreateActivityModal({
  isOpen,
  onClose,
  onAdd,
  startDate,
  endDate,
}: CreateActivityModalProps) {
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(startDate);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [url, setUrl] = useState('');
  const [location, setLocation] = useState('');
  const [priceType, setPriceType] = useState<PriceType>('unique');
  const [uniquePrice, setUniquePrice] = useState('');
  const [babyPrice, setBabyPrice] = useState('');
  const [childPrice, setChildPrice] = useState('');
  const [adultPrice, setAdultPrice] = useState('');

  const days = eachDayOfInterval({
    start: new Date(startDate),
    end: new Date(endDate),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Le titre de l'activité est requis");
      return;
    }

    try {
      setIsSubmitting(true);

      // Définir l'heure en fonction du moment de la journée
      const activityDate = new Date(selectedDate);
      if (timeOfDay === 'morning') {
        activityDate.setHours(9, 0, 0, 0);
      } else if (timeOfDay === 'afternoon') {
        activityDate.setHours(14, 0, 0, 0);
      } else {
        activityDate.setHours(9, 0, 0, 0);
      }

      const response = await fetch(`/api/groups/${params.id}/events/${params.eventId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          duration: timeOfDay === 'fullday' ? 'FULL_DAY' : 'HALF_DAY',
          url: url || null,
          location: location || null,
          uniquePrice: priceType === 'unique' ? (uniquePrice ? parseFloat(uniquePrice) : null) : null,
          babyPrice: priceType === 'differentiated' ? (babyPrice ? parseFloat(babyPrice) : null) : null,
          childPrice: priceType === 'differentiated' ? (childPrice ? parseFloat(childPrice) : null) : null,
          adultPrice: priceType === 'differentiated' ? (adultPrice ? parseFloat(adultPrice) : null) : null,
          date: activityDate.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création de l'activité");
      }

      toast.success("Activité ajoutée avec succès");
      onAdd?.();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erreur lors de la création de l'activité");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-8 text-gray-900 shadow w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold">
              Ajouter une activité
            </Dialog.Title>
            <button
              className="rounded-full p-1 hover:bg-gray-100"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre de l'activité *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <select
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                required
              >
                {days.map((day) => (
                  <option key={format(day, 'yyyy-MM-dd')} value={format(day, 'yyyy-MM-dd')}>
                    {format(day, 'dd MMMM yyyy')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moment de la journée *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTimeOfDay('morning')}
                  className={`px-4 py-2 rounded-lg border ${
                    timeOfDay === 'morning'
                      ? 'bg-gray-900 border-gray-900 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Matin
                </button>
                <button
                  type="button"
                  onClick={() => setTimeOfDay('afternoon')}
                  className={`px-4 py-2 rounded-lg border ${
                    timeOfDay === 'afternoon'
                      ? 'bg-gray-900 border-gray-900 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Après-midi
                </button>
                <button
                  type="button"
                  onClick={() => setTimeOfDay('fullday')}
                  className={`px-4 py-2 rounded-lg border ${
                    timeOfDay === 'fullday'
                      ? 'bg-gray-900 border-gray-900 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Journée
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lien vers l'activité
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lieu
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="Adresse de l'activité"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Prix par personne
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPriceType('unique')}
                  className={`px-4 py-2 rounded-lg border ${
                    priceType === 'unique'
                      ? 'bg-gray-900 border-gray-900 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Prix unique
                </button>
                <button
                  type="button"
                  onClick={() => setPriceType('differentiated')}
                  className={`px-4 py-2 rounded-lg border ${
                    priceType === 'differentiated'
                      ? 'bg-gray-900 border-gray-900 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Prix différencié
                </button>
              </div>

              {priceType === 'unique' ? (
                <div>
                  <label className="block text-xs text-gray-500">
                    Prix par personne
                  </label>
                  <input
                    type="number"
                    value={uniquePrice}
                    onChange={(e) => setUniquePrice(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="0.00 €"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500">
                      Bébés
                    </label>
                    <input
                      type="number"
                      value={babyPrice}
                      onChange={(e) => setBabyPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="0.00 €"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">
                      Enfants
                    </label>
                    <input
                      type="number"
                      value={childPrice}
                      onChange={(e) => setChildPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="0.00 €"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">
                      Adultes
                    </label>
                    <input
                      type="number"
                      value={adultPrice}
                      onChange={(e) => setAdultPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      placeholder="0.00 €"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {isSubmitting ? "En cours..." : "Ajouter"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
