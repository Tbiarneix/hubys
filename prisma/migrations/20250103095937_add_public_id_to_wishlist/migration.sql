/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `WishList` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "WishList" ADD COLUMN     "publicId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "WishList_publicId_key" ON "WishList"("publicId");
