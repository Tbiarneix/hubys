/*
  Warnings:

  - Added the required column `userId` to the `Menu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Menu" ADD COLUMN "url" TEXT;
ALTER TABLE "Menu" ADD COLUMN "userId" TEXT;

DO $$ 
DECLARE 
  admin_id TEXT;
BEGIN
  -- Get first admin user
  SELECT "User".id INTO admin_id
  FROM "User" 
  INNER JOIN "GroupMember" ON "User".id = "GroupMember"."userId" 
  WHERE "GroupMember".role = 'ADMIN' 
  LIMIT 1;

  -- Update userId column with admin user id
  UPDATE "Menu" SET "userId" = admin_id;
END $$;

-- Make userId NOT NULL
ALTER TABLE "Menu" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Menu_userId_idx" ON "Menu"("userId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
