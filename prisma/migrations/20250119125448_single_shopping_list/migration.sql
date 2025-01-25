/*
  Warnings:

  - A unique constraint covering the columns `[eventId]` on the table `ShoppingList` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ShoppingList" ALTER COLUMN "name" SET DEFAULT 'Liste de courses';

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingList_eventId_key" ON "ShoppingList"("eventId");
