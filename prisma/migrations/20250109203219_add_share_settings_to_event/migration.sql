-- AlterTable
ALTER TABLE "GroupMember" ADD COLUMN     "partnerId" TEXT;

-- CreateTable
CREATE TABLE "_GroupMemberChildren" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GroupMemberChildren_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GroupMemberChildren_B_index" ON "_GroupMemberChildren"("B");

-- CreateIndex
CREATE INDEX "GroupMember_partnerId_idx" ON "GroupMember"("partnerId");

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupMemberChildren" ADD CONSTRAINT "_GroupMemberChildren_A_fkey" FOREIGN KEY ("A") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupMemberChildren" ADD CONSTRAINT "_GroupMemberChildren_B_fkey" FOREIGN KEY ("B") REFERENCES "GroupMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
