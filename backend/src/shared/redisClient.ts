import { Redis } from "@upstash/redis";
import { config } from "@config/dotenv";
import NodeCache from "node-cache";

// Cache local em memória para reduzir chamadas ao Redis
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

// Interface que corresponde às opções do Upstash Redis
interface RedisSetOptions {
  ex?: number;
}

class OptimizedRedisClient {
  private redis: Redis;
  private pendingDeletes: Set<string> = new Set();
  private deleteTimer: NodeJS.Timeout | null = null;
  
  constructor(redis: Redis) {
    this.redis = redis;
  }

  // Otimizado para verificar cache local primeiro
  async get(key: string) {
    // Verifica cache local primeiro
    const localValue = localCache.get<any>(key);
    if (localValue !== undefined) {
      return localValue;
    }
    
    // Se não encontrar no cache local, busca no Redis
    const value = await this.redis.get(key);
    
    // Armazena no cache local se encontrou
    if (value !== null && value !== undefined) {
      const ttl = await this.redis.ttl(key);
      // Se TTL > 0, usa esse valor, caso contrário usa o padrão
      if (ttl > 0) {
        localCache.set(key, value, ttl);
      } else {
        localCache.set(key, value);
      }
    }
    
    return value;
  }

  // Otimizado para atualizar cache local junto com Redis
  async set(key: string, value: any, options?: RedisSetOptions) {
    // Armazena no cache local com o mesmo TTL
    if (options?.ex) {
      localCache.set(key, value, options.ex);
    } else {
      localCache.set(key, value);
    }
    
    // Registra a chave para invalidação de padrões
    registerKey(key, [`${key.split(':')[0]}:*`]);
    
    // Armazena no Redis - converte para o formato esperado pelo Upstash
    if (options?.ex) {
      return this.redis.set(key, value, { ex: options.ex });
    } else {
      return this.redis.set(key, value);
    }
  }

  // Otimizado para batch deletes - agora com garantia de execução
  async del(key: string) {
    // Remove do cache local imediatamente
    localCache.del(key);
    unregisterKey(key);
    
    // Executa a exclusão diretamente no Redis para garantir que ocorra
    return this.redis.del(key);
  }

  // Otimizado para usar cache local e minimizar chamadas
  async keys(pattern: string) {
    // Se temos o padrão mapeado localmente, use-o
    if (keyPatternMap[pattern] && keyPatternMap[pattern].size > 0) {
      return Array.from(keyPatternMap[pattern]);
    }
    
    // Caso contrário, consulta o Redis
    return this.redis.keys(pattern);
  }

  // Processa exclusões em lote
  private async flushDeletes() {
    if (this.pendingDeletes.size === 0) {
      this.deleteTimer = null;
      return;
    }
    
    const keys = Array.from(this.pendingDeletes);
    this.pendingDeletes.clear();
    this.deleteTimer = null;
    
    if (keys.length === 1) {
      await this.redis.del(keys[0]);
    } else if (keys.length > 1) {
      await this.redis.del(...keys);
    }
  }

  // Método adicional para invalidar padrões de forma eficiente
  async delByPattern(pattern: string) {
    let keys: string[] = [];
    
    // Verifica o mapa local primeiro
    if (keyPatternMap[pattern]) {
      keys = Array.from(keyPatternMap[pattern]);
      keys.forEach(key => {
        localCache.del(key);
        unregisterKey(key);
      });
    } else {
      // Caso contrário, busque do Redis
      keys = await this.redis.keys(pattern);
    }
    
    if (keys.length === 0) return 0;
    
    // Usa um único comando del com múltiplas chaves
    if (keys.length === 1) {
      return this.redis.del(keys[0]);
    } else {
      return this.redis.del(...keys);
    }
  }

  // Passagem direta para outros métodos do Redis
  async ttl(key: string) {
    return this.redis.ttl(key);
  }

  // Método simplificado para testar conexão
  async ping() {
    return this.redis.ping();
  }
}

let redisClient: OptimizedRedisClient;

try {
  const redis = new Redis({
    url: config.upstashRedisUrl,
    token: config.upstashRedisToken,
  });
  
  redisClient = new OptimizedRedisClient(redis);
} catch (error) {
  console.error("Erro ao inicializar o Redis:", error);
  process.exit(1);
}

export default redisClient;