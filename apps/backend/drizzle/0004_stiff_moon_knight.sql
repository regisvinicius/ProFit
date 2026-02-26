ALTER TABLE "users" RENAME COLUMN "profile_picture_url" TO "profile_picture_key";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" varchar(255);