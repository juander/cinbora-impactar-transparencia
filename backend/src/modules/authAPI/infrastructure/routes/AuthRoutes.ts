import { FastifyInstance } from "fastify";
import { loginSchema } from "../schemas/AuthSchema";
import { getLoginAPIController } from "@config/dependencysInjection/authAPIDependencyInjection";

async function AuthRoutes(fastify: FastifyInstance) {
    // Usar a função factory para obter o controller com acesso ao fastify
    const loginAPIController = getLoginAPIController(fastify);
    
    fastify.post("/login", { schema: loginSchema }, async (request, reply) => {
        // Passar o request e o reply diretamente para o método handle
        return loginAPIController.handle(request, reply);
    });
}

export { AuthRoutes };