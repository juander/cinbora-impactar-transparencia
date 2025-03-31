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
import MongoClient from "@shared/mongoClient"; 

const server = Fastify({ 
  logger: true,
  connectionTimeout: 60000,
}).withTypeProvider<ZodTypeProvider>();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.setErrorHandler((error, request, reply) => {
  if (error.validation) {
    reply.status(400).send({ error: "Dados inválidos", details: error.validation });
  } else if (error instanceof CustomError) {
    reply.status(error.statusCode).send({ error: error.message });
  } else {
    console.error("Erro interno:", error);
    reply.status(500).send({ error: "Erro interno no servidor", message: error.message });
  }
});

const start = async () => {
  try {
    // Conectar ao MongoDB
    const mongoClient = MongoClient.getInstance();
    await mongoClient.connect();

    await server.register(cors, {
      origin: '*',
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

    await server.listen({ port: 3333, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();