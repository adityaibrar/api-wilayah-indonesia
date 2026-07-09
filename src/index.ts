import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { app } from "./app";

const server = new Elysia()
  // Melayani file statis hasil build dari Svelte SPA di folder public
  .use(staticPlugin({ assets: "public", prefix: "/" }))
  // Fallback ke index.html untuk Svelte SPA routing (misal jika ada halaman /docs)
  .get("/", () => Bun.file("public/index.html"))
  // Gunakan routing API yang sudah dipisah di app.ts
  .use(app)
  .listen(3000);

console.log(`🦊 Elysia is running at ${server.server?.hostname}:${server.server?.port}`);
