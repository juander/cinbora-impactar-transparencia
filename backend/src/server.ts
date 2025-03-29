import 'module-alias/register';
import 'tsconfig-paths/register';
import Fastify from "fastify";
import { config } from "./config/dotenv";
import { routes } from "./routes/index";
import cors from "@fastify/cors";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { validatorCompiler, serializerCompiler, type ZodTypeProvider, jsonSchemaTransform } from "fastify-type-provider-zod";
import fastifyMultipart from "@fastify/multipart"; 
import { CustomError } from '@shared/customError';
import { Prisma } from "@prisma/client";

const server = Fastify({ 
  logger: true,
  // Aumentar o timeout para operações que podem demorar mais
  connectionTimeout: 60000,
}).withTypeProvider<ZodTypeProvider>();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.setErrorHandler((error, request, reply) => {
  if (error.validation) {
    reply.status(400).send({ error: "Dados inválidos", details: error.validation });
  } else if (error instanceof CustomError) {
    reply.status(error.statusCode).send({ error: error.message });
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    reply.status(400).send({ error: "Erro no banco de dados", message: error.message });
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    reply.status(422).send({ error: "Erro de validação no Prisma", message: error.message });
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    reply.status(500).send({ error: "Erro de inicialização do Prisma", message: error.message });
  } else {
    console.error("Erro interno:", error);
    reply.status(500).send({ error: "Erro interno no servidor", message: error.message });
  }
});

const start = async () => {
  await server.register(cors, {
    origin: [config.frontendUrl || 'http://localhost:3005'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await server.register(fastifySwagger, {
    openapi: {
      info: {
        title: "API Documentation",
        description: "API documentation for the project",
        version: "1.0.0",
      },
    },
    transform: jsonSchemaTransform, 
  });

  await server.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });

  await server.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // Limite de tamanho de arquivo de 10 MB
    },
  });
  
  await server.register(routes);

  try {
    await server.listen({ port: 3333, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();