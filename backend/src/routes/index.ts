import { FastifyInstance } from "fastify";
import { FastifyTypedInstance } from "@config/zodType";
import { AuthRoutes } from "@modules/authAPI";
import { userRoutes } from "@modules/user";
import { ongRoutes } from "@modules/ong";
import { actionRoutes } from "@modules/action";
import { fileRoutes } from "@modules/file";
import { logRoutes } from "@modules/log";
import { diagnosticRoutes } from "@modules/cache";
import { registerCacheCleanupHook } from "@middlewares/cacheCleanupHook";

export async function routes(fastify: FastifyInstance) {
  // Registre o hook de limpeza de cache uma única vez
  registerCacheCleanupHook(fastify);

  // Registre suas rotas
  await fastify.register(AuthRoutes);
  await fastify.register(userRoutes);
  await fastify.register(ongRoutes);
  await fastify.register(actionRoutes);
  await fastify.register(fileRoutes);
  await fastify.register(logRoutes);

  // Endpoint de diagnóstico do cache
  await fastify.register(diagnosticRoutes);
}