import "dotenv/config";

import fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { resolve } from "node:path";

import { memoriesRoutes } from "./routes/memories";
import { authRoutes } from "./routes/auth";
import { uploadRoutes } from "./routes/upload";

const app = fastify({
  logger: true
});

app.register(multipart);

app.register(fastifyStatic, {
  root: resolve(__dirname, "../uploads"),
  prefix: "/uploads"
});

app.register(cors, {
  origin: true
});

app.register(jwt, {
  secret: "spacetime"
});

app.register(authRoutes);
app.register(memoriesRoutes);
app.register(uploadRoutes);

app
  .listen({
    port: 3333
  })
  .then(() => {
    console.log("🚀 HTTP server running on http://localhost:3333");
  });
