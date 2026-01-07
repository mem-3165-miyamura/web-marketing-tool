/*
  Warnings:

  - You are about to drop the column `isAbTest` on the `PopUpConfig` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `PopUpConfig` table. All the data in the column will be lost.
  - You are about to drop the column `testGroup` on the `PopUpConfig` table. All the data in the column will be lost.
  - You are about to drop the column `context` on the `TrackingLog` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `TrackingLog` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `TrackingLog` table. All the data in the column will be lost.
  - You are about to drop the column `trackingData` on the `TrackingLog` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `siteId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `popUpId` to the `TrackingLog` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hashedPassword` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropIndex
DROP INDEX "TrackingLog_siteId_eventType_idx";

-- AlterTable
ALTER TABLE "PopUpConfig" DROP COLUMN "isAbTest",
DROP COLUMN "parentId",
DROP COLUMN "testGroup",
ADD COLUMN     "buttonTextB" TEXT,
ADD COLUMN     "descriptionB" TEXT,
ADD COLUMN     "imageUrlB" TEXT,
ADD COLUMN     "titleB" TEXT;

-- AlterTable
ALTER TABLE "TrackingLog" DROP COLUMN "context",
DROP COLUMN "sessionId",
DROP COLUMN "timestamp",
DROP COLUMN "trackingData",
ADD COLUMN     "pattern" TEXT NOT NULL DEFAULT 'A',
ADD COLUMN     "popUpId" TEXT NOT NULL,
ALTER COLUMN "siteId" DROP NOT NULL,
ALTER COLUMN "pageUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
DROP COLUMN "image",
DROP COLUMN "siteId",
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "hashedPassword" SET NOT NULL;

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "VerificationToken";

-- CreateIndex
CREATE INDEX "TrackingLog_popUpId_eventType_pattern_idx" ON "TrackingLog"("popUpId", "eventType", "pattern");

-- AddForeignKey
ALTER TABLE "TrackingLog" ADD CONSTRAINT "TrackingLog_popUpId_fkey" FOREIGN KEY ("popUpId") REFERENCES "PopUpConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
