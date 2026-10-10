/*
  Warnings:

  - A unique constraint covering the columns `[nationalId]` on the table `teachers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "nationalId" VARCHAR(20);

-- CreateIndex
CREATE UNIQUE INDEX "teachers_nationalId_key" ON "teachers"("nationalId");
