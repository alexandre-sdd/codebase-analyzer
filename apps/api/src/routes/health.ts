import type { FastifyInstance } from "fastify";

export function registerHealthRoutes(server: FastifyInstance) {
  server.get("/v1/health", async () => ({ ok: true }));
}

