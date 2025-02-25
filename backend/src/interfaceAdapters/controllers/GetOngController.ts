import { FastifyRequest, FastifyReply } from "fastify";
import { GetOngUseCase } from "../../application/useCases/GetOngUseCase";

class GetOngController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const getOngUseCase = new GetOngUseCase();
    try {
      const ngos = await getOngUseCase.execute();
      reply.send(ngos);
    } catch (error) {
      console.error("Erro ao obter ONGs:", error);
      reply.status(500).send({ error: "Erro ao obter ONGs" });
    }
  }
}

export { GetOngController };
