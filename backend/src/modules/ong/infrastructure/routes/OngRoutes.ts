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
    cachedRoute(
      fastify, 
      async (request, reply) => {
        const result = await ongController.getOneWithGrafic(request);
        return reply.send(result);
      },
      { 
        ttl: 21600, // Cache de 6h
        keyGenerator: (req) => {
          const params = req.params as { id: number };
          return `ong:${params.id}:with-grafic`;
        }, 
        tags: ['ongs'] // Para invalidação por tag
      }
    )
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
        ttl: 21600, // Cache por 6h
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
    const ongId = request.user.ngoId;
    
    // Chaves padronizadas
    await Promise.all([
      invalidateCache(fastify, `ong:${ongId}:with-grafic`),
      invalidateCache(fastify, `ongs:list`)
    ]);
    
    return reply.send(result);
  });
}

export { ongRoutes };
