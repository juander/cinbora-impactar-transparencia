import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { fileController } from "@config/dependencysInjection/fileDependencyInjection"
import { authMiddleware } from "@middlewares/authMiddleware";
import { OngParams, ActionParams, DeleteParams } from "@routeParams/RouteParams";
import { deleteFileSchema, getOngFilesSchema, getActionFilesSchema } from "@modules/file"
import { cachedRoute, invalidateCache, invalidateCachePattern } from "@middlewares/cacheMiddleware";
import { CustomError } from "@shared/customError";

type RouteHandler = (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

interface ActionFileDeleteParams extends DeleteParams {
  actionId: string;
}

async function fileRoutes(fastify: FastifyInstance) {
  
  // Upload routes with category-specific cache invalidation
  fastify.post("/ongs/files/upload", 
    { preHandler: [authMiddleware] }, 
    async (request, reply) => {
      try {
        // Call controller but don't send response yet
        const fileEntity = await fileController.uploadOngFile(request, reply);
        
        // Invalidate cache first, then send response
        if (fileEntity && request.user) {
          const cacheCategory = fileController.getCacheCategory(fileEntity.category);
          const cachePath = `ongs:${request.user.ngoId}:files:${cacheCategory}`;
          
          try {
            await invalidateCache(fastify, cachePath);
          } catch (cacheError) {
            console.error('Error invalidating cache:', cacheError);
          }
        }
        
        // Now send the response
        return reply.send(fileEntity);
      } catch (error) {
        if (error instanceof CustomError) {
          return reply.status(error.statusCode).send({ error: error.message });
        } else {
          return reply.status(500).send({ error: "Erro interno ao fazer upload do arquivo" });
        }
      }
    }
  );
  
  fastify.post<{ Params: ActionParams }>(
    "/ongs/actions/:actionId/files/upload", 
    { preHandler: [authMiddleware] }, 
    async (request, reply) => {
      try {
        // Call controller but don't send response yet
        const fileEntity = await fileController.uploadActionFile(request);
        
        // Invalidate cache first, then send response
        if (fileEntity && request.params.actionId) {
          const cacheCategory = fileController.getCacheCategory(fileEntity.category);
          const cachePath = `actions:${request.params.actionId}:files:${cacheCategory}`;
          
          try {
            await invalidateCache(fastify, cachePath);
          } catch (cacheError) {
            console.error('Error invalidating cache:', cacheError);
          }
        }
        
        // Now send the response
        return reply.send(fileEntity);
      } catch (error) {
        if (error instanceof CustomError) {
          return reply.status(error.statusCode).send({ error: error.message });
        } else {
          return reply.status(500).send({ error: "Erro interno ao fazer upload do arquivo" });
        }
      }
    }
  );
  
  // Delete routes with route-specific cache invalidation
  fastify.delete<{ Params: DeleteParams }>(
    "/ongs/files/:id", 
    { preHandler: [authMiddleware], schema: deleteFileSchema }, 
    async (request, reply) => {
      try {
        // Call controller but don't send response yet
        const result = await fileController.delete(request, 'ong');
        
        // Invalidate cache first, then send response
        if (result && request.user) {
          const cacheCategory = fileController.getCacheCategory(result.category);
          const cachePath = `ongs:${request.user.ngoId}:files:${cacheCategory}`;
          
          try {
            await invalidateCache(fastify, cachePath);
          } catch (cacheError) {
            console.error('Error invalidating cache:', cacheError);
          }
        }
        
        // Now send the response
        return reply.send({ 
          message: "Arquivo deletado com sucesso", 
          category: result.category
        });
      } catch (error) {
        if (error instanceof CustomError) {
          return reply.status(error.statusCode).send({ error: error.message });
        } else {
          return reply.status(500).send({ error: "Erro interno ao deletar arquivo" });
        }
      }
    }
  );
  
  fastify.delete<{ Params: ActionFileDeleteParams }>(
    "/ongs/actions/:actionId/files/:id", 
    { preHandler: [authMiddleware], schema: deleteFileSchema }, 
    async (request, reply) => {
      try {
        // Call controller but don't send response yet
        const result = await fileController.delete(request, 'action');
        
        // Invalidate cache first, then send response
        if (result && request.params.actionId) {
          const cacheCategory = fileController.getCacheCategory(result.category);
          const cachePath = `actions:${request.params.actionId}:files:${cacheCategory}`;
          
          try {
            await invalidateCache(fastify, cachePath);
          } catch (cacheError) {
            console.error('Error invalidating cache:', cacheError);
          }
        }
        
        // Now send the response
        return reply.send({ 
          message: "Arquivo deletado com sucesso", 
          category: result.category
        });
      } catch (error) {
        if (error instanceof CustomError) {
          return reply.status(error.statusCode).send({ error: error.message });
        } else {
          return reply.status(500).send({ error: "Erro interno ao deletar arquivo" });
        }
      }
    }
  );

  // Get ONG file routes with caching
  fastify.get<{ Params: OngParams }>(
    "/ongs/:ngoId/files/images", 
    cachedRoute(
      fastify, 
      ((request, reply) => fileController.getOngImages(request as FastifyRequest<{ Params: OngParams }>, reply)) as RouteHandler,
      { 
        ttl: 21600,
        keyGenerator: (req) => {
          const params = req.params as OngParams;
          return `ongs:${params.ngoId}:files:images`;
        },
        tags: ['files', 'images', 'ongs']
      }
    )
  );
  
  fastify.get<{ Params: OngParams }>(
    "/ongs/:ngoId/files/videos", 
    cachedRoute(
      fastify, 
      ((request, reply) => fileController.getOngVideos(request as FastifyRequest<{ Params: OngParams }>, reply)) as RouteHandler,
      { 
        ttl: 21600,
        keyGenerator: (req) => {
          const params = req.params as OngParams;
          return `ongs:${params.ngoId}:files:videos`;
        },
        tags: ['files', 'videos', 'ongs']
      }
    )
  );
  
  fastify.get<{ Params: OngParams }>(
    "/ongs/:ngoId/files/reports", 
    cachedRoute(
      fastify, 
      ((request, reply) => fileController.getOngReportFiles(request as FastifyRequest<{ Params: OngParams }>, reply)) as RouteHandler,
      { 
        ttl: 21600,
        keyGenerator: (req) => {
          const params = req.params as OngParams;
          return `ongs:${params.ngoId}:files:reports`;
        },
        tags: ['files', 'reports', 'ongs'] 
      }
    )
  );
  
  fastify.get<{ Params: OngParams }>(
    "/ongs/:ngoId/files/tax_invoices", 
    cachedRoute(
      fastify, 
      ((request, reply) => fileController.getOngTaxInvoicesFiles(request as FastifyRequest<{ Params: OngParams }>, reply)) as RouteHandler,
      { 
        ttl: 21600,
        keyGenerator: (req) => {
          const params = req.params as OngParams;
          return `ongs:${params.ngoId}:files:tax_invoices`;
        },
        tags: ['files', 'tax_invoices', 'ongs']
      }
    )
  );
  
  fastify.get<{ Params: OngParams }>(
    "/ongs/:ngoId/files/others", 
    cachedRoute(
      fastify, 
      ((request, reply) => fileController.getOngOtherFiles(request as FastifyRequest<{ Params: OngParams }>, reply)) as RouteHandler,
      { 
        ttl: 21600,
        keyGenerator: (req) => {
          const params = req.params as OngParams;
          return `ongs:${params.ngoId}:files:others`;
        },
        tags: ['files', 'others', 'ongs']
      }
    )
  );

  // Get Action file routes with caching
  fastify.get<{ Params: ActionParams }>(
    "/ongs/actions/:actionId/files/images", 
    cachedRoute(
      fastify, 
      ((request, reply) => fileController.getActionImages(request as FastifyRequest<{ Params: ActionParams }>, reply)) as RouteHandler,
      { 
        ttl: 21600,
        keyGenerator: (req) => {
          const params = req.params as ActionParams;
          return `actions:${params.actionId}:files:images`;
        },
        tags: ['files', 'images', 'actions']
      }
    )
  );
  
  fastify.get<{ Params: ActionParams }>(
    "/ongs/actions/:actionId/files/videos",  
    cachedRoute(
      fastify, 
      ((request, reply) => fileController.getActionVideos(request as FastifyRequest<{ Params: ActionParams }>, reply)) as RouteHandler,
      { 
        ttl: 21600,
        keyGenerator: (req) => {
          const params = req.params as ActionParams;
          return `actions:${params.actionId}:files:videos`;
        },
        tags: ['files', 'videos', 'actions']
      }
    )
  );
  
  fastify.get<{ Params: ActionParams }>(
    "/ongs/actions/:actionId/files/reports", 
    cachedRoute(
      fastify, 
      ((request, reply) => fileController.getActionReportFiles(request as FastifyRequest<{ Params: ActionParams }>, reply)) as RouteHandler,
      { 
        ttl: 21600,
        keyGenerator: (req) => {
          const params = req.params as ActionParams;
          return `actions:${params.actionId}:files:reports`;
        },
        tags: ['files', 'reports', 'actions']
      }
    )
  );
  
  fastify.get<{ Params: ActionParams }>(
    "/ongs/actions/:actionId/files/tax_invoices", 
    cachedRoute(
      fastify, 
      ((request, reply) => fileController.getActionTaxInvoicesFiles(request as FastifyRequest<{ Params: ActionParams }>, reply)) as RouteHandler,
      { 
        ttl: 21600,
        keyGenerator: (req) => {
          const params = req.params as ActionParams;
          return `actions:${params.actionId}:files:tax_invoices`;
        },
        tags: ['files', 'tax_invoices', 'actions']
      }
    )
  );
  
  fastify.get<{ Params: ActionParams }>(
    "/ongs/actions/:actionId/files/others",  
    cachedRoute(
      fastify, 
      ((request, reply) => fileController.getActionOtherFiles(request as FastifyRequest<{ Params: ActionParams }>, reply)) as RouteHandler,
      { 
        ttl: 21600,
        keyGenerator: (req) => {
          const params = req.params as ActionParams;
          return `actions:${params.actionId}:files:others`;
        },
        tags: ['files', 'others', 'actions']
      }
    )
  );
}

export { fileRoutes };