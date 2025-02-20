import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";
import { CreateUserController } from "./controllers/createUserController";
import { listUsersController } from "./controllers/listUsersControoller";
import { DeleleUserController } from "./controllers/deleteUserController";
import { loginAPIController } from "./controllers/loginAPIController";

export async function routes(fastify: FastifyInstance, options: FastifyPluginOptions) {

  fastify.get('/users', async (request: FastifyRequest, reply: FastifyReply) => {
    return new listUsersController().handle(request, reply);
  });

  fastify.post('/user', async (request: FastifyRequest, reply: FastifyReply) => {
    return new CreateUserController().handle(request, reply);
  });

  fastify.delete('/user', async (request: FastifyRequest, reply: FastifyReply) => {
    return new DeleleUserController().handle(request, reply);
  });

  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    return new loginAPIController().handle(request, reply);
  });
}