import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import tokens from "./tokens";
import users from "./users";

export const runtime = 'edge'

const app = new Hono().basePath('/api')

const routes = app
    .route("/tokens", tokens)
    .route("/users", users);

export const GET = handle(app)
export const POST = handle(app)
console.log(routes);

export type AppType = typeof routes;