"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActivities } from "@/hooks/events/use-activities";

const schema = z.object({
  title: z.string().min(1, "Titre requis"),
  link: z.string().url("URL invalide").optional().or(z.literal("")),
  location: z.string().optional(),
  priceAdult: z.number().min(0).optional(),
  priceChild: z.number().min(0).optional(),
  priceBaby: z.number().min(0).optional(),
});

type FormData = z.infer<typeof schema>;

interface ActivityDialogProps {
  eventId: string;
  date?: Date;
  open: boolean;
  onClose: () => void;
}

export function ActivityDialog({ eventId, date, open, onClose }: ActivityDialogProps) {
  const { addActivity, isLoading } = useActivities(eventId, date);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!date) return;
    
    await addActivity({
      ...data,
      date,
    });
    
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une activité</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              {...register("title")}
              placeholder="Titre de l'activité"
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Input
              {...register("link")}
              placeholder="Lien (optionnel)"
              type="url"
              disabled={isLoading}
            />
            {errors.link && (
              <p className="text-sm text-destructive mt-1">{errors.link.message}</p>
            )}
          </div>

          <div>
            <Input
              {...register("location")}
              placeholder="Lieu (optionnel)"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Input
                {...register("priceAdult", { valueAsNumber: true })}
                placeholder="Prix adulte"
                type="number"
                step="0.01"
                min="0"
                disabled={isLoading}
              />
            </div>
            <div>
              <Input
                {...register("priceChild", { valueAsNumber: true })}
                placeholder="Prix enfant"
                type="number"
                step="0.01"
                min="0"
                disabled={isLoading}
              />
            </div>
            <div>
              <Input
                {...register("priceBaby", { valueAsNumber: true })}
                placeholder="Prix bébé"
                type="number"
                step="0.01"
                min="0"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} type="button">
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}