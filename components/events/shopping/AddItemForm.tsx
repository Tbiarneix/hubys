"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  quantity: z.string().optional(),
  category: z.string().min(1, "Catégorie requise"),
});

type FormData = z.infer<typeof schema>;

interface AddItemFormProps {
  categories: string[];
  onAdd: (data: FormData) => Promise<void>;
}

export function AddItemForm({ categories, onAdd }: AddItemFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await onAdd(data);
      reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3">
      <div className="flex-1">
        <Input
          {...register("name")}
          placeholder="Article"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="w-32">
        <Input
          {...register("quantity")}
          placeholder="Quantité"
          disabled={isLoading}
        />
      </div>

      <div className="w-40">
        <Select
          {...register("category")}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        Ajouter
      </Button>
    </form>
  );
}