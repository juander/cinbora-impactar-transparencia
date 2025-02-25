import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";
import { CreateUserController } from "./controllers/userController/createUserController";
import { listUsersController } from "./controllers/userController/listUsersControoller";
import { DeleleUserController } from "./controllers/userController/deleteUserController";
import { loginAPIController } from "./controllers/externalAPIController/loginAPIController";
import { UploadFileController } from "./controllers/fileController/uploadFileController";
import fastifyMultipart from '@fastify/multipart';

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

  fastify.register(fastifyMultipart);

  fastify.post('/upload', async (request: FastifyRequest, reply: FastifyReply) => {
    return new UploadFileController().handle(request, reply);
  });

}