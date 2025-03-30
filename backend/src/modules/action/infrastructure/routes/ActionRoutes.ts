import { FastifyInstance } from "fastify";
import { createActionSchema, updateActionSchema, deleteActionSchema } from "../schemas/ActionSchema";
import { authMiddleware } from "@middlewares/authMiddleware";
import { OngParams, OngActionParams, ActionParams } from "@routeParams/RouteParams";
import { actionController } from "@config/dependencysInjection/actionDependencyInjection";
import { cachedRoute, invalidateCache } from "@middlewares/cacheMiddleware";

async function actionRoutes(fastify: FastifyInstance) {

  // Rota para buscar uma ação específica com suas despesas
  fastify.get<{ Params: OngActionParams }>(
    "/ongs/actions/:actionId", 
    cachedRoute(
      fastify,
      async (request, reply) => {
        const result = await actionController.getOneWithExpenses(request);
        return reply.send(result);
      },
      { 
        ttl: 84600, // Cache de 1 dia
        keyGenerator: (req) => {
          const params = req.params as OngActionParams;
          return `actions:${params.actionId}:with-expenses`;
        },
        tags: ['actions']
      }
    )
  );

  // Rota para listar todas as ações de uma ONG com cache
  fastify.get<{ Params: OngParams }>(
    "/ongs/:id/actions", 
    cachedRoute(
      fastify, 
      async (request, reply) => {
        const actions = await actionController.getAll(request);
        return reply.send(actions);
      },
      { 
        ttl: 84600, // Cache por 1 dia
        keyGenerator: (req) => {
          // Usar o parâmetro como está na URL
          const params = req.params as { id: number };
          return `ongs:${params.id}:actions:list`;
        },
        tags: ['actions', 'ongs']
      }
    )
  ); 

  // Rota para criar uma nova ação
  fastify.post(
    "/ongs/actions", 
    { preHandler: [authMiddleware], schema: createActionSchema }, 
    async (request, reply) => {
      const result = await actionController.create(request);
      if (request.user) {
        await Promise.all([
          invalidateCache(fastify, `ongs:${request.user.ngoId}:actions:list`),
          invalidateCache(fastify, `ong:${request.user.ngoId}:with-grafic`)
        ]);
      }
      return reply.status(201).send(result);
    }
  ); 

  // Rota para atualizar uma ação
  fastify.put<{ Params: ActionParams }>(
    "/ongs/actions/:id", 
    { preHandler: [authMiddleware], schema: updateActionSchema }, 
    async (request, reply) => {
      const result = await actionController.update(request);
      if (request.user) {
        const actionId = request.params.actionId;
        // Chaves padronizadas - sem prefixo 'cache:'
        await Promise.all([
          invalidateCache(fastify, `actions:${actionId}:with-expenses`),
          invalidateCache(fastify, `ongs:${request.user.ngoId}:actions:list`)
        ]);
      }
      return reply.send(result);
    }
  );

  // Rota para deletar uma ação
  fastify.delete<{ Params: ActionParams }>(
    "/ongs/actions/:id", 
    { preHandler: [authMiddleware], schema: deleteActionSchema }, 
    async (request, reply) => {
      const result = await actionController.delete(request);
      if (request.user) {
        const actionId = request.params.actionId;
        // Chaves padronizadas - sem prefixo 'cache:'
        await Promise.all([
          invalidateCache(fastify, `ongs:${request.user.ngoId}:actions:list`),
          invalidateCache(fastify, `ong:${request.user.ngoId}:with-grafic`)
        ]);
      }
      return reply.send(result);
    }
  );

  // Rota para atualizar o gráfico de despesas de uma ação
  fastify.put<{ Params: { actionId: string } }>(
    "/ongs/actions/:actionId/grafic", 
    { preHandler: [authMiddleware] }, 
    async (request, reply) => {
      const result = await actionController.updateActionExpensesGrafic(request);
      if (request.user) {
        const actionId = request.params.actionId;
        // Chaves padronizadas
        await Promise.all([
          invalidateCache(fastify, `actions:${actionId}:with-expenses`),
          invalidateCache(fastify, `ongs:${request.user.ngoId}:actions:list`),
          invalidateCache(fastify, `ong:${request.user.ngoId}:with-grafic`)
        ]);
      }
      return reply.send(result);
    }
  );

  // Rota para atualizar a imagem de uma ação
  fastify.put<{ Params: ActionParams }>(
    "/ongs/actions/:id/image", 
    { preHandler: [authMiddleware] }, 
    async (request, reply) => {
      const result = await actionController.updateActionImage(request);
      if (request.user) {
        const actionId = request.params.actionId;
        // Chaves padronizadas - sem prefixo 'cache:'
        await Promise.all([
          invalidateCache(fastify, `actions:${actionId}:with-expenses`),
          invalidateCache(fastify, `ongs:${request.user.ngoId}:actions:list`)
        ]);
      }
      return reply.send(result);
    }
  );
}

export { actionRoutes };