-- CreateEnum
CREATE TYPE "RecipeCategory" AS ENUM ('STARTER', 'MAIN', 'DESSERT', 'SIDE', 'BREAKFAST', 'SNACK', 'DRINK', 'OTHER');

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "category" "RecipeCategory" NOT NULL DEFAULT 'OTHER';
