/*
  Warnings:

  - You are about to drop the column `userId` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `conversationId` on the `messages` table. All the data in the column will be lost.
  - Added the required column `userID` to the `conversations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conversationID` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_conversationId_fkey";

-- DropIndex
DROP INDEX "conversations_userId_idx";

-- DropIndex
DROP INDEX "messages_conversationId_idx";

-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "userId",
ADD COLUMN     "userID" UUID NOT NULL;

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "conversationId",
ADD COLUMN     "conversationID" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "conversations_userID_idx" ON "conversations"("userID");

-- CreateIndex
CREATE INDEX "messages_conversationID_idx" ON "messages"("conversationID");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationID_fkey" FOREIGN KEY ("conversationID") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
