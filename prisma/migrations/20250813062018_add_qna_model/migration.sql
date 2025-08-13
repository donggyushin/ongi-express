-- CreateTable
CREATE TABLE "public"."qnas" (
    "id" TEXT NOT NULL,
    "question" VARCHAR(500) NOT NULL,
    "answer" VARCHAR(1500) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qnas_pkey" PRIMARY KEY ("id")
);
