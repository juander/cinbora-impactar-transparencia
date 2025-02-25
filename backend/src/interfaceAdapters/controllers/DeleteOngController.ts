import { FastifyRequest, FastifyReply } from "fastify";
import { DeleteOngUseCase } from "../../application/useCases/DeleteOngUseCase";

class DeleteOngController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const deleteOngUseCase = new DeleteOngUseCase();
    try {
      await deleteOngUseCase.execute({ id });
      reply.send({ message: "ONG deletada com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar ONG:", error);
      reply.status(500).send({ error: "Erro ao deletar ONG" });
    }
  }
}

export { DeleteOngController };
