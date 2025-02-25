import { FastifyRequest, FastifyReply } from "fastify";
import { GetOngService } from "../../services/externalAPIService/getOngService";

class GetOngController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const getOngService = new GetOngService();
    try {
      const ngos = await getOngService.execute();
      reply.send(ngos);
    } catch (error) {
      console.error("Erro ao obter ONGs:", error);
      reply.status(500).send({ error: "Erro ao obter ONGs" });
    }
  }
}

export { GetOngController };
