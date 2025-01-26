/*
  Warnings:

  - You are about to drop the column `hasLocation` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LocationVote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_eventId_fkey";

-- DropForeignKey
ALTER TABLE "LocationVote" DROP CONSTRAINT "LocationVote_locationId_fkey";

-- DropForeignKey
ALTER TABLE "LocationVote" DROP CONSTRAINT "LocationVote_userId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "hasLocation",
ADD COLUMN     "hasRental" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Location";

-- DropTable
DROP TABLE "LocationVote";

-- CreateTable
CREATE TABLE "Rental" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Rental_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalVote" (
    "id" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RentalVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RentalVote_rentalId_userId_key" ON "RentalVote"("rentalId", "userId");

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalVote" ADD CONSTRAINT "RentalVote_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalVote" ADD CONSTRAINT "RentalVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
