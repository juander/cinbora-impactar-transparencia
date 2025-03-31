import { FastifyInstance } from "fastify";
import {
  deleteOngSchema,
  createOngSchema,
  updateOngSchema,
  updateNgoGraficSchema,
  getNgoAndGraficSchema,
  getNgosSchema,
} from "@modules/ong";
import { ongController } from "@config/dependencysInjection/ongDependencyInjection";
import { OngParams } from "@routeParams/RouteParams";
import { authMiddleware } from "@middlewares/authMiddleware";
import { cachedRoute, invalidateCache } from "@middlewares/cacheMiddleware";

async function ongRoutes(fastify: FastifyInstance) {

  // Rota para devolver a ONG e seu gráfico
  fastify.get<{ Params: { id: number } }>(
    "/ongs/:id", 
      async (request, reply) => {
        const result = await ongController.getOneWithGrafic(request);
        return reply.send(result);
      },
    );

  // Rota para atualizar o gráfico da ONG
  fastify.put("/ongs/grafic", { preHandler: [authMiddleware], schema: updateNgoGraficSchema }, async (request, reply) => {
    const result = await ongController.updateNgoGrafic(request);
    // Chave padronizada sem prefixo 'cache:' (será adicionado pelo invalidateCache)
    const ongId = (request.body as any).id;
    await invalidateCache(fastify, `ong:${ongId}:with-grafic`);
    return reply.send(result);
  });

  // Rota com cache para lista de ONGs
  fastify.get(
    "/ongs",
    { schema: getNgosSchema },
    cachedRoute(
      fastify,
      async (request, reply) => {
        const ngos = await ongController.getAll();
        return reply.send(ngos);
      },
      { 
        ttl: 84600, // Cache por 1 dia
        keyGenerator: () => `ongs:list`, // Chave específica e simples
        tags: ['ongs']
      }
    )
  );

  // Rota para deletar uma ONG
  fastify.delete<{ Params: OngParams }>("/ongs/:id", { preHandler: [authMiddleware], schema: deleteOngSchema }, async (request, reply) => {
    const result = await ongController.delete(request);
    
    // Chaves padronizadas
    await Promise.all([
      invalidateCache(fastify, `ong:${request.params.ngoId}:with-grafic`),
      invalidateCache(fastify, `ongs:list`)
    ]);
    
    return reply.send(result);
  });

  // Rota para criar uma ONG
  fastify.post("/ongs", { preHandler: [authMiddleware], schema: createOngSchema }, async (request, reply) => {
    const ong = await ongController.create(request);
    
    // Chave padronizada
    await invalidateCache(fastify, `ongs:list`);
    
    return reply.status(201).send(ong);
  });

  // Rota para atualizar uma ONG
  fastify.put("/ongs", { preHandler: [authMiddleware], schema: updateOngSchema }, async (request, reply) => {
    const result = await ongController.update(request);
    const ongId = (request.body as any).id;
    
    // Chaves padronizadas
    await Promise.all([
      invalidateCache(fastify, `ong:${ongId}:with-grafic`),
      invalidateCache(fastify, `ongs:list`)
    ]);
    
    return reply.send(result);
  });
}

export { ongRoutes };