import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { localCache, registerKey } from "@shared/cacheClient";
import cacheClient from "@shared/cacheClient";

interface CacheOptions {
  /** Tempo de expiração em segundos */
  ttl?: number;
  /** Prefixo opcional para a chave de cache */
  prefix?: string;
  /** Função para extrair uma chave personalizada (sobrepõe a url padrão) */
  keyGenerator?: (request: FastifyRequest) => string;
  /** Tags para agrupar chaves relacionadas para invalidação */
  tags?: string[];
}

/**
 * Middleware para armazenar em cache o resultado de uma rota
 * @param fastify Instância do Fastify
 * @param options Opções de configuração do cache
 */
export function withCache(
  fastify: FastifyInstance,
  options: CacheOptions = {}
) {
  const ttl = options.ttl || 600; // Padrão: 600 segundos (10 minutos)
  const prefix = options.prefix || 'cache';

  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Não aplicar cache a métodos não-GET
    if (request.method !== 'GET') {
      return;
    }

    try {
      // Gerar a chave de cache com prefixo padronizado
      const cacheKey = options.keyGenerator
        ? `${prefix}:${options.keyGenerator(request)}`
        : `${prefix}:${request.url.split('?')[0].replace(/\//g, ':')}`;
      
      // Verificar no cache local
      const cachedData = await cacheClient.get(cacheKey);
      
      if (cachedData) {
        // HIT no cache
        reply.header('x-cache', 'HIT');
        reply.header('x-cache-key', cacheKey);
        reply.send(cachedData);
        return true; // Sinaliza que a resposta foi manipulada
      }
      
      // Intercepta a função send do reply para armazenar o resultado no cache
      const originalSend = reply.send;
      reply.send = function cachingSend(payload) {
        // Apenas armazena em cache se a resposta for bem-sucedida
        if (reply.statusCode >= 200 && reply.statusCode < 400) {
          try {
            // Garantir que o payload seja serializável
            const plainData = typeof payload === 'string' 
              ? payload 
              : JSON.parse(JSON.stringify(payload));
            
            // Determinar padrões para esta chave
            const patterns = [
              `${prefix}:*`,
              ...((options.tags || []).map(tag => `${tag}:*`))
            ];
            
            // Registrar a chave com seus padrões para invalidação eficiente
            registerKey(cacheKey, patterns);
            
            // Armazenar no cache
            cacheClient.set(cacheKey, plainData, { ex: ttl });
            
            // Adicionar cabeçalhos informativos
            reply.header('x-cache', 'MISS');
            reply.header('x-cache-key', cacheKey); 
            reply.header('x-cache-ttl', String(ttl));
          } catch (err) {
            fastify.log.error(`Cache serialization error: ${err}`);
            reply.header('x-cache-error', String(err));
          }
        } else {
          // Se não for bem-sucedido, apenas indique que não foi cacheado
          reply.header('x-cache', 'NO-CACHE');
          reply.header('x-cache-reason', 'non-success-status');
        }

        // Restaura o método original e envia a resposta
        reply.send = originalSend;
        return reply.send(payload);
      };

      return false; // Sinaliza que o processamento deve continuar
    } catch (err) {
      fastify.log.error(`Cache middleware error: ${err}`);
      reply.header('x-cache-error', String(err));
      return false; // Continua o processamento mesmo em caso de erro
    }
  };
}

/**
 * Normaliza uma chave de cache para garantir o prefixo correto
 * @param key Chave de cache para normalizar
 */
function normalizeKey(key: string): string {
  // Se a chave já começa com 'cache:', retorna como está
  if (key.startsWith('cache:')) {
    return key;
  }
  // Se não, adiciona o prefixo 'cache:'
  return `cache:${key}`;
}

/**
 * Invalida uma chave de cache específica
 * @param fastify Instância Fastify
 * @param key Chave a ser invalidada
 */
export async function invalidateCache(fastify: FastifyInstance, key: string): Promise<void> {
  const normalizedKey = normalizeKey(key);
  await cacheClient.del(normalizedKey);
  fastify.log.info(`Cache invalidado: ${normalizedKey}`);
}

/**
 * Invalida várias chaves de cache que correspondem a um padrão
 * @param fastify Instância Fastify
 * @param pattern Padrão para correspondência (ex: 'cache:ongs:*')
 * @returns Número de chaves invalidadas
 */
export async function invalidateCachePattern(fastify: FastifyInstance, pattern: string): Promise<number> {
  const normalizedPattern = normalizeKey(pattern);
  const count = await cacheClient.delByPattern(normalizedPattern);
  fastify.log.info(`Cache invalidado por padrão: ${normalizedPattern} (${count} chaves)`);
  return count; // Retornar contagem para uso em outras funções
}

/**
 * Obtém um manipulador de rota com cache
 * Especialmente útil para rotas que retornam diretamente do controller
 */
export function cachedRoute(
  fastify: FastifyInstance,
  handler: (request: FastifyRequest, reply: FastifyReply) => Promise<any>,
  options: CacheOptions = {}
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Tenta usar o cache primeiro
    const handled = await withCache(fastify, options)(request, reply);
    
    // Se a resposta já foi manipulada pelo cache, retorna
    if (handled) {
      return;
    }
    
    // Caso contrário, executa o handler original
    return handler(request, reply);
  };
}