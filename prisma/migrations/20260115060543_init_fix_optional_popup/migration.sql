/*
  Warnings:

  - Added the required column `userId` to the `Visitor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TrackingLog" DROP CONSTRAINT "TrackingLog_popUpId_fkey";

-- AlterTable
ALTER TABLE "TrackingLog" ALTER COLUMN "popUpId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Visitor" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Visitor_userId_idx" ON "Visitor"("userId");

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingLog" ADD CONSTRAINT "TrackingLog_popUpId_fkey" FOREIGN KEY ("popUpId") REFERENCES "PopUpConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;
