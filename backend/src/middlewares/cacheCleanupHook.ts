import { FastifyInstance } from "fastify";
import { invalidateCachePattern } from "./cacheMiddleware";

/**
 * Função para registrar um hook que limpa caches antigos durante a inicialização
 */
export function registerCacheCleanupHook(fastify: FastifyInstance) {
  // Usamos Symbol para garantir que o hook só seja registrado uma vez
  const CACHE_CLEANUP_REGISTERED = Symbol('CACHE_CLEANUP_REGISTERED');
  
  // Se já registrou, não faça novamente
  if ((fastify as any)[CACHE_CLEANUP_REGISTERED]) {
    return;
  }
  
  // Registra o hook
  fastify.addHook('onReady', async () => {
    // Limpar todos os tipos de cache usando padrões consistentes
    await Promise.all([
      // Padrões para ONGs
      invalidateCachePattern(fastify, `cache:ong:*`).then(count => {
        fastify.log.info(`Cache de ONGs individuais invalidado (${count} chaves)`);
      }),
      invalidateCachePattern(fastify, `cache:ongs:*`).then(count => {
        fastify.log.info(`Cache de listas de ONGs invalidado (${count} chaves)`);
      }),
      
      // Padrões para Ações
      invalidateCachePattern(fastify, `cache:actions:*`).then(count => {
        fastify.log.info(`Cache de ações invalidado (${count} chaves)`);
      }),
      
      // Padrões para Arquivos
      invalidateCachePattern(fastify, `cache:*:files:*`).then(count => {
        fastify.log.info(`Cache de arquivos invalidado (${count} chaves)`);
      }),
      
      // Padrões alternativos para compatibilidade legada (converter para o novo formato)
      invalidateCachePattern(fastify, `cache:/ongs/*`).then(count => {
        if (count > 0) {
          fastify.log.warn(`Encontradas ${count} chaves no formato antigo. Por favor, atualize o código.`);
        }
      })
    ]);
    
    fastify.log.info('Limpeza de cache concluída com sucesso');
  });
  
  // Marca como registrado
  (fastify as any)[CACHE_CLEANUP_REGISTERED] = true;
}
