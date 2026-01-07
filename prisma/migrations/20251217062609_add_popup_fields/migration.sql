/*
  Warnings:

  - You are about to drop the column `configData` on the `PopUpConfig` table. All the data in the column will be lost.
  - You are about to drop the column `conversionGoal` on the `PopUpConfig` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `PopUpConfig` table. All the data in the column will be lost.
  - You are about to drop the column `siteId` on the `PopUpConfig` table. All the data in the column will be lost.
  - You are about to drop the column `targetUrlMatch` on the `PopUpConfig` table. All the data in the column will be lost.
  - Added the required column `description` to the `PopUpConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `PopUpConfig` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `PopUpConfig` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "PopUpConfig" DROP CONSTRAINT "PopUpConfig_userId_fkey";

-- DropIndex
DROP INDEX "PopUpConfig_siteId_idx";

-- AlterTable
ALTER TABLE "PopUpConfig" DROP COLUMN "configData",
DROP COLUMN "conversionGoal",
DROP COLUMN "isActive",
DROP COLUMN "siteId",
DROP COLUMN "targetUrlMatch",
ADD COLUMN     "buttonLink" TEXT NOT NULL DEFAULT '#',
ADD COLUMN     "buttonText" TEXT NOT NULL DEFAULT '詳細を見る',
ADD COLUMN     "clicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "displayDelay" INTEGER NOT NULL DEFAULT 3000,
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "PopUpConfig" ADD CONSTRAINT "PopUpConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
