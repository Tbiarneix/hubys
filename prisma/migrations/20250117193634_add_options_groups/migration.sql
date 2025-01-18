-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "showCalendar" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showEvents" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showRecipes" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showSecretSanta" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Subgroup" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "adults" TEXT[],
    "children" TEXT[],
    "activeAdults" TEXT[],
    "activeChildren" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subgroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubgroupPresence" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "lunch" BOOLEAN NOT NULL DEFAULT false,
    "dinner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subgroupId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "SubgroupPresence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subgroup_eventId_idx" ON "Subgroup"("eventId");

-- CreateIndex
CREATE INDEX "SubgroupPresence_subgroupId_idx" ON "SubgroupPresence"("subgroupId");

-- CreateIndex
CREATE INDEX "SubgroupPresence_eventId_idx" ON "SubgroupPresence"("eventId");

-- CreateIndex
CREATE INDEX "SubgroupPresence_date_idx" ON "SubgroupPresence"("date");

-- CreateIndex
CREATE UNIQUE INDEX "SubgroupPresence_subgroupId_eventId_date_key" ON "SubgroupPresence"("subgroupId", "eventId", "date");

-- AddForeignKey
ALTER TABLE "Subgroup" ADD CONSTRAINT "Subgroup_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubgroupPresence" ADD CONSTRAINT "SubgroupPresence_subgroupId_fkey" FOREIGN KEY ("subgroupId") REFERENCES "Subgroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubgroupPresence" ADD CONSTRAINT "SubgroupPresence_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
