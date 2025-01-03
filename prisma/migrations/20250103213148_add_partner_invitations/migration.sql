-- CreateTable
CREATE TABLE "PartnerInvitation" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartnerInvitation_fromUserId_idx" ON "PartnerInvitation"("fromUserId");

-- CreateIndex
CREATE INDEX "PartnerInvitation_toUserId_idx" ON "PartnerInvitation"("toUserId");

-- CreateIndex
CREATE INDEX "PartnerInvitation_email_idx" ON "PartnerInvitation"("email");

-- AddForeignKey
ALTER TABLE "PartnerInvitation" ADD CONSTRAINT "PartnerInvitation_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerInvitation" ADD CONSTRAINT "PartnerInvitation_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
