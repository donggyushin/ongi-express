-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_account_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."profiles"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;
