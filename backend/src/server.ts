import Fastify from "fastify";
import { routes } from "./routes";
import cors from "@fastify/cors";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { validatorCompiler, serializerCompiler } from "fastify-type-provider-zod";

const server = Fastify({ logger: true });

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.setErrorHandler((error, request, reply) => {
    reply.code(400).send({ message: error.message})
})

const start = async () => {
  await server.register(cors);

  await server.register(fastifySwagger, {
    openapi: {
      info: {
        title: "API Documentation",
        description: "API documentation for the project",
        version: "1.0.0",
      }
    },
    exposeRoute: true
  });

  await server.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
    transformSpecificationClone: true
  });

  await server.register(routes);

  try {
    await server.listen({ port: 3333 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();