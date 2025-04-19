CREATE TABLE "waitlist_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_verified" boolean DEFAULT false,
	"verification_token" text,
	"verification_token_expires_at" timestamp,
	CONSTRAINT "waitlist_entries_email_unique" UNIQUE("email")
);
