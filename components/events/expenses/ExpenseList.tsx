"use client";

import { Expense } from "@/types/expense";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
}

export function ExpenseList({ expenses, isLoading }: ExpenseListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">
        Aucune dépense enregistrée
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="flex justify-between items-center p-4 bg-muted rounded-lg"
        >
          <div>
            <h4 className="font-medium">{expense.description}</h4>
            <p className="text-sm text-muted-foreground">
              Payé par {expense.paidByUser.firstName} {expense.paidByUser.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(expense.createdAt), "d MMMM yyyy", { locale: fr })}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium">{formatPrice(expense.amount)}</p>
            <p className="text-sm text-muted-foreground">
              {expense.sharedWithUsers.length + 1} participants
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}