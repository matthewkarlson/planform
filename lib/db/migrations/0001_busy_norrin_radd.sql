ALTER TABLE "agencies" ADD COLUMN "api_key" text;--> statement-breakpoint
ALTER TABLE "agencies" ADD CONSTRAINT "agencies_api_key_unique" UNIQUE("api_key");