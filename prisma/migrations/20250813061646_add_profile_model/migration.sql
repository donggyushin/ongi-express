-- CreateEnum
CREATE TYPE "public"."MBTIType" AS ENUM ('INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP');

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "nickname" VARCHAR(50) NOT NULL,
    "profile_image" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mbti" "public"."MBTIType",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_account_id_key" ON "public"."profiles"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_nickname_key" ON "public"."profiles"("nickname");

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
