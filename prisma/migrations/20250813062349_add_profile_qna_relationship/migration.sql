/*
  Warnings:

  - Added the required column `profile_id` to the `qnas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."qnas" ADD COLUMN     "profile_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."qnas" ADD CONSTRAINT "qnas_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
