import { Hono } from "hono";
import { db } from "../../../db/drizzle";
import { insertTokensSchema, tokens } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2"


const app = new Hono()
    .get("/",
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);
            if (!auth?.userId) {
                return c.json({ error: "unauthorized" }, 401);
                // throw new HTTPException(401, {
                //     res: c.json({ error: "unauthorized" }, 401)
                // })
            }
            const data = await db
                .select({
                    id: tokens.id,
                    name: tokens.name,
                    symbol: tokens.symbol,
                    supply: tokens.supply,
                    creator: tokens.creator,
                })
                .from(tokens)
                .where(eq(tokens.creator, auth.userId))

            return c.json({ data })
        })
    .post("/",
        clerkMiddleware(),
        zValidator("json", insertTokensSchema.pick({
            name: true,
            symbol: true,
            supply: true,
        })),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) {
                return c.json({ error: "unauthorized" }, 401)
            }

            const [data] = await db.insert(tokens).values({
                id: createId(),
                creator: auth.userId,
                owner: "address",
                address: "true",
                ...values,
            }).returning();


            return c.json({ data })
        }
    )

export default app;