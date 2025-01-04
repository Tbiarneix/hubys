/*
  Warnings:

  - You are about to drop the column `parentId` on the `Child` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Child" DROP CONSTRAINT "Child_parentId_fkey";

-- DropIndex
DROP INDEX "Child_parentId_idx";

-- AlterTable
ALTER TABLE "Child" DROP COLUMN "parentId";

-- CreateTable
CREATE TABLE "_ParentChild" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ParentChild_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ParentChild_B_index" ON "_ParentChild"("B");

-- AddForeignKey
ALTER TABLE "_ParentChild" ADD CONSTRAINT "_ParentChild_A_fkey" FOREIGN KEY ("A") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParentChild" ADD CONSTRAINT "_ParentChild_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
