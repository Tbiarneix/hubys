-- CreateTable
CREATE TABLE "SecretSanta" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecretSanta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecretSantaAssignment" (
    "id" TEXT NOT NULL,
    "secretSantaId" TEXT NOT NULL,
    "giverId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecretSantaAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SecretSanta_groupId_idx" ON "SecretSanta"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "SecretSanta_groupId_year_key" ON "SecretSanta"("groupId", "year");

-- CreateIndex
CREATE INDEX "SecretSantaAssignment_secretSantaId_idx" ON "SecretSantaAssignment"("secretSantaId");

-- CreateIndex
CREATE INDEX "SecretSantaAssignment_giverId_idx" ON "SecretSantaAssignment"("giverId");

-- CreateIndex
CREATE INDEX "SecretSantaAssignment_receiverId_idx" ON "SecretSantaAssignment"("receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "SecretSantaAssignment_secretSantaId_giverId_key" ON "SecretSantaAssignment"("secretSantaId", "giverId");

-- CreateIndex
CREATE UNIQUE INDEX "SecretSantaAssignment_secretSantaId_receiverId_key" ON "SecretSantaAssignment"("secretSantaId", "receiverId");

-- AddForeignKey
ALTER TABLE "SecretSanta" ADD CONSTRAINT "SecretSanta_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecretSantaAssignment" ADD CONSTRAINT "SecretSantaAssignment_secretSantaId_fkey" FOREIGN KEY ("secretSantaId") REFERENCES "SecretSanta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecretSantaAssignment" ADD CONSTRAINT "SecretSantaAssignment_giverId_fkey" FOREIGN KEY ("giverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecretSantaAssignment" ADD CONSTRAINT "SecretSantaAssignment_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
