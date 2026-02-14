import type { Express } from "express";

export function registerHealthRoutes(app: Express) {
  app.get("/v1/health", (req, res) => {
    res.json({ ok: true });
  });
}
