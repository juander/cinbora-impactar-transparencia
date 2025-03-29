import { FastifyInstance } from "fastify";
import { loginSchema } from "../schemas/AuthSchema";
import { getLoginAPIController } from "@config/dependencysInjection/authAPIDependencyInjection";

async function AuthRoutes(fastify: FastifyInstance) {
    // Usar a função factory para obter o controller com acesso ao fastify
    const loginAPIController = getLoginAPIController(fastify);
    
    fastify.post("/login", { schema: loginSchema }, loginAPIController.handle.bind(loginAPIController));
}

export { AuthRoutes };