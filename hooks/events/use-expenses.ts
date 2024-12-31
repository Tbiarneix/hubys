"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Expense, Balance } from "@/types/expense";

export function useExpenses(eventId: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const { toast } = useToast();

  const fetchExpenses = async () => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/expenses`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error();

      const data = await response.json();
      setExpenses(data.expenses);
      setBalances(data.balances);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les dépenses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addExpense = async (data: {
    description: string;
    amount: number;
    sharedWith: string[];
  }) => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/expenses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) throw new Error();

      const newData = await response.json();
      setExpenses(newData.expenses);
      setBalances(newData.balances);

      toast({
        title: "Dépense ajoutée",
        description: "La dépense a été ajoutée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la dépense",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [eventId, session]);

  return {
    expenses,
    balances,
    isLoading,
    addExpense,
  };
}