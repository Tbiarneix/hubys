"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useProfile } from "@/hooks/use-profile";

const profileSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().optional(),
  birthDate: z.date().optional(),
  bio: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { user, isLoading, updateProfile } = useProfile();
  
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
      birthDate: user?.birthDate,
      bio: user?.bio,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    await updateProfile(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Input
          {...register("firstName")}
          placeholder="Prénom"
          disabled={isLoading}
        />
        {errors.firstName && (
          <p className="text-sm text-destructive">{errors.firstName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Input
          {...register("lastName")}
          placeholder="Nom (optionnel)"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Calendar
          mode="single"
          selected={user?.birthDate}
          onSelect={(date) => register("birthDate").onChange(date)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Textarea
          {...register("bio")}
          placeholder="Bio (optionnelle)"
          disabled={isLoading}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}