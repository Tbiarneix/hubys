/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { ActivityDuration } from '@prisma/client';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  onAdd?: () => void;
}

type PriceType = 'unique' | 'differentiated';

export function CreateActivityModal({
  isOpen,
  onClose,
  date,
  onAdd
}: CreateActivityModalProps) {
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState<ActivityDuration>('HALF_DAY');
  const [url, setUrl] = useState('');
  const [location, setLocation] = useState('');
  const [priceType, setPriceType] = useState<PriceType>('unique');
  const [uniquePrice, setUniquePrice] = useState('');
  const [babyPrice, setBabyPrice] = useState('');
  const [childPrice, setChildPrice] = useState('');
  const [adultPrice, setAdultPrice] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Le titre de l'activité est requis");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/groups/${params.id}/events/${params.eventId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          duration,
          url: url || null,
          location: location || null,
          uniquePrice: priceType === 'unique' ? (uniquePrice ? parseFloat(uniquePrice) : null) : null,
          babyPrice: priceType === 'differentiated' ? (babyPrice ? parseFloat(babyPrice) : null) : null,
          childPrice: priceType === 'differentiated' ? (childPrice ? parseFloat(childPrice) : null) : null,
          adultPrice: priceType === 'differentiated' ? (adultPrice ? parseFloat(adultPrice) : null) : null,
          date: date.toISOString(),
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
            {/* Titre */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Titre *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                required
              />
            </div>

            {/* Durée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durée *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDuration('HALF_DAY')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    duration === 'HALF_DAY'
                      ? 'bg-gray-900 text-white border-gray-700'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  } border`}
                >
                  Demi-journée
                </button>
                <button
                  type="button"
                  onClick={() => setDuration('FULL_DAY')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    duration === 'FULL_DAY'
                      ? 'bg-gray-900 text-white border-gray-700'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  } border`}
                >
                  Journée
                </button>
              </div>
            </div>

            {/* URL */}
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                Lien vers l'activité
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Lieu
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                placeholder="Adresse de l'activité"
              />
            </div>

            {/* Prix */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Prix par personne
              </label>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <button
                  type="button"
                  onClick={() => setPriceType('unique')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    priceType === 'unique'
                      ? 'bg-gray-900 text-white border-gray-700'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  } border`}
                >
                  Prix unique
                </button>
                <button
                  type="button"
                  onClick={() => setPriceType('differentiated')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    priceType === 'differentiated'
                      ? 'bg-gray-900 text-white border-gray-700'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  } border`}
                >
                  Prix différencié
                </button>
              </div>

              {priceType === 'unique' ? (
                <div>
                  <label htmlFor="uniquePrice" className="block text-xs text-gray-500">
                    Prix par personne
                  </label>
                  <input
                    type="number"
                    id="uniquePrice"
                    value={uniquePrice}
                    onChange={(e) => setUniquePrice(e.target.value)}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                    placeholder="0.00 €"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="babyPrice" className="block text-xs text-gray-500">
                      Bébés
                    </label>
                    <input
                      type="number"
                      id="babyPrice"
                      value={babyPrice}
                      onChange={(e) => setBabyPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                      placeholder="0.00 €"
                    />
                  </div>
                  <div>
                    <label htmlFor="childPrice" className="block text-xs text-gray-500">
                      Enfants
                    </label>
                    <input
                      type="number"
                      id="childPrice"
                      value={childPrice}
                      onChange={(e) => setChildPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                      placeholder="0.00 €"
                    />
                  </div>
                  <div>
                    <label htmlFor="adultPrice" className="block text-xs text-gray-500">
                      Adultes
                    </label>
                    <input
                      type="number"
                      id="adultPrice"
                      value={adultPrice}
                      onChange={(e) => setAdultPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                      placeholder="0.00 €"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md border border-transparent bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                {isSubmitting ? "Création..." : "Créer"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
