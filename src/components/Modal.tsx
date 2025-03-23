/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import AuthForm from "@/components/auth/AuthForm";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Modal({ isOpen, onClose }: ModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'inscription');
      }

      toast.success("Super ! Tu fais maintenant partie de la liste d'attente.", {
        description: "On te tient au courant dès que l'application est disponible !",
        duration: 5000,
      });

      setEmail("");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Oups ! Une erreur est survenue.", {
        description: "Merci de réessayer plus tard ou de nous contacter directement.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-700 rounded-full"
        >
          <X size={24} />
        </button>
        
        <p className="text-gray-600 mb-8 mt-8">
          Pour l'instant l'accès à Hubys se fait sur invitation. Utilisez le formulaire d'inscription si vous avez reçu un code.
        </p>

        <AuthForm />
      </div>
    </div>
  );
}