import { pgTable, text, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod"

export const tokens = pgTable("tokens", {
    id: text("token_id").primaryKey(),
    creator: text("token_creator_id").notNull(),
    plaidId: text("plaid_id"),
    name: text("token_name").notNull(),
    owner: text("token_owner").notNull(),
    address: text("token_address").notNull(),
    supply: numeric("token_supply").notNull(),
    symbol: text("token_symbol").notNull(),
});

export const insertTokensSchema = createInsertSchema(tokens);

export const users = pgTable("users", {
    userId: text("user_id").primaryKey(),
    plaidId: text("plaid_id"),
    privateKey: text("private_key").notNull(),
})

export const insertUsersSchema = createInsertSchema(users);