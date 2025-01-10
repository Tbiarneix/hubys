-- AlterTable
ALTER TABLE "Event" ADD COLUMN "adultShare" FLOAT NOT NULL DEFAULT 1,
                    ADD COLUMN "childShare" FLOAT NOT NULL DEFAULT 0.5; 