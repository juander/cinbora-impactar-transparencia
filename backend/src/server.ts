import Fastify from "fastify";
import { routes } from "./routes";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { validatorCompiler, serializerCompiler } from "fastify-type-provider-zod";

const server = Fastify({ logger: true });

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.setErrorHandler((error, request, reply) => {
    reply.code(400).send({ message: error.message})
})

const start = async () => {
  await server.register(cors);

  await server.register(swagger, ({
    openapi: {
      info: {
        title: "API Documentation",
        description: "API documentation for the project",
        version: "1.0.0",
      },
      servers: [
        {
          url: "http://localhost:3333",
        },
      ],
    },
  }));

  await server.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    staticCSP: true,
    transformSpecificationClone: true,
  });

  await server.register(routes);

  try {
    await server.listen({ port: 3333 });
  } catch (err) {
    process.exit(1);
  }
};

start();