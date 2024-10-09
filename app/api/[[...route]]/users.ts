import { Hono } from "hono";
import { db } from "../../../db/drizzle";
import { insertUsersSchema, users } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";


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
                    id: users.userId,
                    key: users.privateKey,
                })
                .from(users)
                .where(eq(users.userId, auth.userId))

            return c.json({ data })
        })
    .post("/",
        clerkMiddleware(),
        zValidator("json", insertUsersSchema.pick({
            privateKey: true,
        })),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) {
                return c.json({ error: "unauthorized" }, 401)
            }

            const [data] = await db.insert(users).values({
                userId: auth.userId,
                ...values,
            }).returning();


            return c.json({ data })
        }
    )

export default app;