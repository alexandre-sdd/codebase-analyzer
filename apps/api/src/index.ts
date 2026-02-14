import cors from "@fastify/cors";
import Fastify from "fastify";
import { z } from "zod";
import { loadEnv } from "./lib/env";
import { registerHealthRoutes } from "./routes/health";
import { registerJobRoutes } from "./routes/jobs";

const env = loadEnv(process.env);

const server = Fastify({
  logger: {
    level: env.LOG_LEVEL,
  },
});

await server.register(cors, {
  origin: env.CORS_ORIGINS,
});

registerHealthRoutes(server);
registerJobRoutes(server, env);

server.get("/v1", async () => ({
  name: "codebase-analyzer-api",
  ok: true,
}));

server.setErrorHandler((err, _req, reply) => {
  const message = err instanceof Error ? err.message : String(err);
  const details = err instanceof z.ZodError ? err.flatten() : undefined;
  const statusCode = typeof (err as any)?.statusCode === "number" ? (err as any).statusCode : 500;

  server.log.error({ err }, "request error");
  void reply.status(statusCode).send({
    error: {
      message,
      details,
    },
  });
});

await server.listen({
  host: env.HOST,
  port: env.PORT,
});

server.log.info(
  {
    host: env.HOST,
    port: env.PORT,
    jobsDir: env.JOBS_DIR,
    llmProvider: env.LLM_PROVIDER,
  },
  "api listening",
);

