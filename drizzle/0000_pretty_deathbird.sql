CREATE TABLE IF NOT EXISTS "tokens" (
	"token_id" text PRIMARY KEY NOT NULL,
	"token_creator_id" text NOT NULL,
	"plaid_id" text,
	"token_name" text NOT NULL,
	"token_owner" text NOT NULL,
	"token_address" text NOT NULL,
	"token_supply" numeric NOT NULL,
	"token_symbol" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"user_id" text PRIMARY KEY NOT NULL,
	"plaid_id" text,
	"private_key" text NOT NULL
);
