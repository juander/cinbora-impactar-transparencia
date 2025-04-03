import { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    redis: {
      get(key: string): Promise<any>;
      set(key: string, value: any, options?: { ex?: number }): Promise<any>;
      del(key: string): Promise<any>;
      keys(pattern: string): Promise<string[]>;
      ttl(key: string): Promise<number>;
      ping(): Promise<string>;
      delByPattern(pattern: string): Promise<number>;
    };
    clearAllCache(): Promise<boolean>;
  }
}