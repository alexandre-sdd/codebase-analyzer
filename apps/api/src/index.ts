import express from "express";
import cors from "cors";
import { z } from "zod";
import { loadEnv } from "./lib/env";
import { registerHealthRoutes } from "./routes/health";
import { registerJobRoutes } from "./routes/jobs";

const env = loadEnv(process.env);

const app = express();

// Middleware
app.use(cors({
  origin: env.CORS_ORIGINS,
}));
app.use(express.json());

// Routes
app.get("/v1", (req, res) => {
  res.json({
    name: "codebase-analyzer-api",
    ok: true,
  });
});

registerHealthRoutes(app);
registerJobRoutes(app, env);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : String(err);
  const details = err instanceof z.ZodError ? err.flatten() : undefined;
  const statusCode = typeof err?.statusCode === "number" ? err.statusCode : 500;

  console.error("Request error:", err);
  res.status(statusCode).json({
    error: {
      message,
      details,
    },
  });
});

const server = app.listen(env.PORT, env.HOST, () => {
  console.log(
    `API listening on ${env.HOST}:${env.PORT}`,
    {
      jobsDir: env.JOBS_DIR,
      llmProvider: env.LLM_PROVIDER,
    }
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
