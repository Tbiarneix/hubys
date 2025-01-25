/*
  Warnings:

  - You are about to drop the column `hasShopping` on the `Event` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,recipeId]` on the table `Ingredient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Ingredient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "hasShopping",
ADD COLUMN     "hasTodoList" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Ingredient_userId_idx" ON "Ingredient"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_userId_recipeId_key" ON "Ingredient"("userId", "recipeId");

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
