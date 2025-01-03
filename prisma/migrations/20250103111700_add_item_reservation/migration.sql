-- AlterTable
ALTER TABLE "WishlistItem" ADD COLUMN "isReserved" BOOLEAN NOT NULL DEFAULT false,
                          ADD COLUMN "reservedBy" TEXT;
