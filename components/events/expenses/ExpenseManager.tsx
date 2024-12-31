"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseList } from "./ExpenseList";
import { ExpenseBalance } from "./ExpenseBalance";
import { ExpenseDialog } from "./ExpenseDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useExpenses } from "@/hooks/events/use-expenses";

interface ExpenseManagerProps {
  eventId: string;
  participants: Array<{ id: string; firstName: string; lastName: string }>;
}

export function ExpenseManager({ eventId, participants }: ExpenseManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { expenses, balances, isLoading, addExpense } = useExpenses(eventId);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Dépenses</h3>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une dépense
        </Button>
      </div>

      <Tabs defaultValue="expenses">
        <TabsList className="mb-4">
          <TabsTrigger value="expenses">Dépenses</TabsTrigger>
          <TabsTrigger value="balance">Équilibre</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <ExpenseList expenses={expenses} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="balance">
          <ExpenseBalance balances={balances} isLoading={isLoading} />
        </TabsContent>
      </Tabs>

      <ExpenseDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={addExpense}
        participants={participants}
      />
    </Card>
  );
}