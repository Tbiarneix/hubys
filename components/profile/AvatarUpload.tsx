"use client";

import { useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";

export function AvatarUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, isLoading, updateAvatar } = useProfile();

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await updateAvatar(file);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="w-32 h-32">
        <AvatarImage src={user?.avatar} alt={user?.firstName} />
        <AvatarFallback>
          {user?.firstName?.[0]}
          {user?.lastName?.[0]}
        </AvatarFallback>
      </Avatar>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
      />

      <Button 
        variant="outline" 
        onClick={handleClick}
        disabled={isLoading}
      >
        <Camera className="w-4 h-4 mr-2" />
        Changer la photo
      </Button>
    </div>
  );
}