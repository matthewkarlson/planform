CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"outcomes" json NOT NULL,
	"price_lower" integer,
	"price_upper" integer,
	"when_to_recommend" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "services_service_id_unique" UNIQUE("service_id")
);
