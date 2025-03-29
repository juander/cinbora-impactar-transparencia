import NodeCache from "node-cache";

// Configuração do cache local em memória
export const localCache = new NodeCache({
  stdTTL: 3600, // 1 hora (3600 segundos)
  checkperiod: 600, // Verificar expiração a cada 10 minutos
  useClones: false, // Evita clonagem profunda
  deleteOnExpire: true, // Limpa automaticamente itens expirados
  maxKeys: 1000 // Limite máximo de chaves para evitar crescimento descontrolado da memória
});

// Mapa para rastrear chaves por padrão (para invalidação eficiente)
export const keyPatternMap: Record<string, Set<string>> = {};

// Registrar uma chave com seus possíveis padrões de invalidação
export function registerKey(key: string, patterns: string[] = []) {
  patterns.forEach(pattern => {
    if (!keyPatternMap[pattern]) {
      keyPatternMap[pattern] = new Set();
    }
    keyPatternMap[pattern].add(key);
  });
}

// Remover uma chave de todos os padrões
export function unregisterKey(key: string) {
  Object.values(keyPatternMap).forEach(keys => {
    keys.delete(key);
  });
}

// Interface para opções de configuração de cache
export interface CacheSetOptions {
  ex?: number; // Tempo de expiração em segundos
}

class LocalCacheClient {
  // Obter valor do cache
  async get(key: string) {
    return localCache.get(key);
  }

  // Definir valor no cache
  async set(key: string, value: any, options?: CacheSetOptions) {
    // Registra a chave para invalidação de padrões
    registerKey(key, [`${key.split(':')[0]}:*`]);
    
    // Armazena no cache local com TTL se fornecido
    if (options?.ex) {
      return localCache.set(key, value, options.ex);
    } else {
      return localCache.set(key, value);
    }
  }

  // Remover chave do cache
  async del(key: string) {
    unregisterKey(key);
    return localCache.del(key);
  }

  // Obter todas as chaves por padrão
  async keys(pattern: string) {
    // Se temos o padrão mapeado, use-o
    if (keyPatternMap[pattern] && keyPatternMap[pattern].size > 0) {
      return Array.from(keyPatternMap[pattern]);
    }
    
    // Caso contrário, filtramos as chaves do cache local
    const allKeys = localCache.keys();
    const regex = new RegExp(pattern.replace('*', '.*'));
    return allKeys.filter(key => regex.test(key));
  }

  // Excluir chaves por padrão
  async delByPattern(pattern: string) {
    let keys: string[] = [];
    let deletedCount = 0;
    
    // Verifica o mapa local primeiro
    if (keyPatternMap[pattern]) {
      keys = Array.from(keyPatternMap[pattern]);
    } else {
      // Caso contrário, busque via regex
      const allKeys = localCache.keys();
      const regex = new RegExp(pattern.replace('*', '.*'));
      keys = allKeys.filter(key => regex.test(key));
    }
    
    // Remove todas as chaves correspondentes
    keys.forEach(key => {
      if (localCache.del(key)) {
        deletedCount++;
      }
      unregisterKey(key);
    });
    
    return deletedCount;
  }

  // Obter tempo restante de expiração
  async ttl(key: string) {
    const ttl = localCache.getTtl(key);
    if (ttl) {
      return Math.floor((ttl - Date.now()) / 1000);
    }
    return -1;
  }

  // Verificação de saúde
  async ping() {
    return "PONG";
  }
  
  // Limpar todo o cache
  async flushAll() {
    localCache.flushAll();
    Object.keys(keyPatternMap).forEach(pattern => {
      keyPatternMap[pattern].clear();
    });
    return true;
  }
}

// Exportar instância única
const cacheClient = new LocalCacheClient();
export default cacheClient;