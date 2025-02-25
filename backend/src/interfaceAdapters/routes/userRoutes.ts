import { FastifyInstance } from "fastify";
import { UserAPIController } from "../controllers/UserAPIController";

const userAPIController = new UserAPIController();

async function userRoutes(fastify: FastifyInstance) {
  fastify.post("/users", userAPIController.create);
  fastify.delete("/users/:id", userAPIController.delete);
}

export { userRoutes };
