-- DropIndex
DROP INDEX "SubgroupPresence_date_idx";

-- DropIndex
DROP INDEX "SubgroupPresence_subgroupId_eventId_date_key";

-- AlterTable
ALTER TABLE "SubgroupPresence" ADD COLUMN     "dinnerNumber" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lunchNumber" INTEGER NOT NULL DEFAULT 0;
