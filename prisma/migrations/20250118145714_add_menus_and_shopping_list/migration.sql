-- CreateEnum
CREATE TYPE "IngredientType" AS ENUM ('VEGETABLE', 'FRUIT', 'MEAT', 'FISH', 'DAIRY', 'GROCERY', 'BAKERY', 'BEVERAGE', 'CONDIMENT', 'OTHER');

-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "numberOfPeople" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "recipeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingItem" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "type" "IngredientType" NOT NULL DEFAULT 'OTHER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShoppingItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Menu_eventId_idx" ON "Menu"("eventId");

-- CreateIndex
CREATE INDEX "Menu_recipeId_idx" ON "Menu"("recipeId");

-- CreateIndex
CREATE INDEX "ShoppingItem_menuId_idx" ON "ShoppingItem"("menuId");

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingItem" ADD CONSTRAINT "ShoppingItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
