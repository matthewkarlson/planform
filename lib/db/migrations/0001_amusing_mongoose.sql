CREATE TABLE "field_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"field_id" integer NOT NULL,
	"value" varchar(100) NOT NULL,
	"label" varchar(255) NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "field_options_field_id_value_unique" UNIQUE("field_id","value")
);
--> statement-breakpoint
CREATE TABLE "question_field_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	CONSTRAINT "question_field_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "question_fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_id" integer NOT NULL,
	"field_type_id" integer NOT NULL,
	"field_id" varchar(100) NOT NULL,
	"label" varchar(255) NOT NULL,
	"placeholder" text,
	"required" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"conditional_logic" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "question_fields_question_id_field_id_unique" UNIQUE("question_id","field_id")
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"agency_id" integer NOT NULL,
	"step" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "questions_agency_id_step_unique" UNIQUE("agency_id","step")
);
--> statement-breakpoint
ALTER TABLE "field_options" ADD CONSTRAINT "field_options_field_id_question_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."question_fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_fields" ADD CONSTRAINT "question_fields_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_fields" ADD CONSTRAINT "question_fields_field_type_id_question_field_types_id_fk" FOREIGN KEY ("field_type_id") REFERENCES "public"."question_field_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE no action ON UPDATE no action;