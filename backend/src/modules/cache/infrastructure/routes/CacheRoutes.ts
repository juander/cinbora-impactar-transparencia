import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { localCache, keyPatternMap } from "@shared/cacheClient";
import cacheClient from "@shared/cacheClient";

// Middleware de proteção para rotas administrativas
async function adminAuthMiddleware(request: FastifyRequest, reply: FastifyReply) {
  // 1. Verificar token de administração no header
  const adminToken = request.headers['x-admin-token'];
  const configuredToken = process.env.ADMIN_TOKEN;
  
  // 2. Lista de IPs permitidos (opcional)
  const allowedIPs = (process.env.ALLOWED_ADMIN_IPS).split(',');
  const clientIP = request.ip;
  
  // Verificar se o token é válido OU se o IP está na lista permitida
  const validToken = adminToken === configuredToken;
  const validIP = allowedIPs.includes(clientIP);
  
  // Em ambiente de desenvolvimento, permitir acesso local sempre
  const isDev = process.env.NODE_ENV === 'development';
  const isLocalIP = clientIP === '127.0.0.1' || clientIP === '::1' || clientIP.startsWith('172.') || clientIP.startsWith('192.168.');
  
  if (!(validToken || (isDev && isLocalIP) || validIP)) {
    reply.status(403).send({ 
      error: "Acesso negado. Autenticação requerida para operações administrativas."
    });
    return reply;
  }
}

export async function diagnosticRoutes(fastify: FastifyInstance) {
  // Rota para verificar estatísticas do cache
  fastify.get("/admin/cache-stats", { preHandler: [adminAuthMiddleware] }, async () => {
    const localStats = localCache.getStats();
    const patternKeys = Object.entries(keyPatternMap).map(([pattern, keys]) => ({
      pattern,
      keyCount: keys.size,
      keys: Array.from(keys)
    }));
    
    return {
      localCache: {
        hits: localStats.hits,
        misses: localStats.misses,
        keys: localStats.keys,
        ksize: localStats.ksize,
        vsize: localStats.vsize
      },
      patterns: patternKeys
    };
  });
  
  // Rota para testar a invalidação de cache
  fastify.post("/admin/invalidate-cache", { preHandler: [adminAuthMiddleware] }, async (request, reply) => {
    const body = request.body as { pattern: string };
    
    if (!body.pattern) {
      return reply.status(400).send({ error: "Pattern não especificado" });
    }
    
    const keysInvalidated = await cacheClient.delByPattern(body.pattern);
    
    return {
      pattern: body.pattern,
      keysInvalidated
    };
  });
  
  // Rota para limpar todo o cache
  fastify.post("/admin/clear-cache", { preHandler: [adminAuthMiddleware] }, async () => {
    const localKeysCleared = localCache.keys().length;
    await cacheClient.flushAll();
    
    return {
      keysCleared: localKeysCleared
    };
  });

  // Rota simples de health check (esta pode continuar pública)
  fastify.get("/api/health", async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      cache: {
        keys: localCache.keys().length,
        hits: localCache.getStats().hits,
        misses: localCache.getStats().misses
      },
      database: "connected"
    };
  });
}