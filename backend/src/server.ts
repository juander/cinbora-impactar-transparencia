import Fastify from "fastify";
import { routes } from "./routes";
import cors from "@fastify/cors";

const server = Fastify({ logger: true})

server.setErrorHandler((error, request, reply) => {
    reply.code(400).send({ message: error.message})
})

const start = async () => {

    await server.register(cors)
    await server.register(routes)

    try{
        await server.listen({ port: 3333 })
    }catch(err){
        process.exit(1)
    }
}
start();