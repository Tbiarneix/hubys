"use client";

import { Balance } from "@/types/expense";
import { formatPrice } from "@/lib/utils";
import { ArrowRight, Loader2 } from "lucide-react";

interface ExpenseBalanceProps {
  balances: Balance[];
  isLoading: boolean;
}

export function ExpenseBalance({ balances, isLoading }: ExpenseBalanceProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (balances.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4">
        Aucun remboursement nécessaire
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {balances.map((balance, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 bg-muted rounded-lg"
        >
          <div className="flex items-center gap-3">
            <span>{balance.from.firstName}</span>
            <ArrowRight className="w-4 h-4" />
            <span>{balance.to.firstName}</span>
          </div>
          <span className="font-medium">{formatPrice(balance.amount)}</span>
        </div>
      ))}
    </div>
  );
}