import { FastifyRequest, FastifyReply } from "fastify";
import { DeleteOngService } from "../../services/externalAPIService/deleteOngService";

class DeleteOngController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const deleteOngService = new DeleteOngService();
    try {
      await deleteOngService.execute({ id });
      reply.send({ message: "ONG deletada com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar ONG:", error);
      reply.status(500).send({ error: "Erro ao deletar ONG" });
    }
  }
}

export { DeleteOngController };
