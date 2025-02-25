import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";
import { LoginAPIController } from "./controllers/externalAPIController/loginAPIController";
import { GetOngController } from "./controllers/externalAPIController/getOngController";
import { DeleteOngController } from "./controllers/externalAPIController/deleteOngController";
import fastifyMultipart from '@fastify/multipart';
import upload from "./config/uploadConfig";
import { z } from "zod";

function multerToFastify(multerMiddleware: any) {
  return (req: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) => {
    multerMiddleware(req.raw, reply.raw, (err: any) => {
      if (err) {
        return done(err);
      }
      done();
    });
  };
}

const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
  response: {
    200: z.object({
      message: z.string(),
      user: z.any(),
      ngo: z.any(),
    }),
  },
};

const getOngSchema = {
  response: {
    200: z.array(z.any()),
  },
};

const deleteOngSchema = {
  params: z.object({
    id: z.string(),
  }),
  response: {
    200: z.object({
      message: z.string(),
    }),
  },
};

export async function routes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.post('/login', { schema: loginSchema }, async (request: FastifyRequest, reply: FastifyReply) => {
    return new LoginAPIController().handle(request, reply);
  });

  fastify.get('/ong', { schema: getOngSchema }, async (request: FastifyRequest, reply: FastifyReply) => {
    return new GetOngController().handle(request, reply);
  });

  fastify.delete('/ong/:id', { schema: deleteOngSchema }, async (request: FastifyRequest, reply: FastifyReply) => {
    return new DeleteOngController().handle(request, reply);
  });
}