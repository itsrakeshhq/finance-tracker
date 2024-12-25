DO $$ BEGIN
 CREATE TYPE "public"."tag" AS ENUM('Food', 'Travel', 'Shopping', 'Investment', 'Salary', 'Bill', 'Others');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."txnType" AS ENUM('Incoming', 'Outgoing');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount" integer NOT NULL,
	"txn_type" "txnType" NOT NULL,
	"summary" text,
	"tag" "tag" DEFAULT 'Others',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
