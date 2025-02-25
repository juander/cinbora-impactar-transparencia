import { FastifyRequest, FastifyReply } from "fastify";
import { CreateUserUseCase } from "../../application/useCases/CreateUserUseCase";
import { DeleteUserUseCase } from "../../application/useCases/DeleteUserUseCase";

class UserAPIController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const { name, email, ngoId } = request.body as { name: string; email: string; ngoId: number };

    const createUserUseCase = new CreateUserUseCase();

    try {
      const user = await createUserUseCase.execute({ name, email, ngoId });
      reply.send(user);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      reply.status(500).send({ error: "Erro ao criar usuário" });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    const deleteUserUseCase = new DeleteUserUseCase();

    try {
      await deleteUserUseCase.execute({ id });
      reply.send({ message: "Usuário deletado com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      reply.status(500).send({ error: "Erro ao deletar usuário" });
    }
  }
}

export { UserAPIController };
