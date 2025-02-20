import { FastifyRequest, FastifyReply } from "fastify";
import { GetOngDataService } from "../services/loginAPIService";

class loginAPIController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as { email: string; password: string };

    const getOngDataService = new GetOngDataService();

    try {
      const data = await getOngDataService.execute({ email, password });
      reply.send(data);
    } catch (error) {
      reply.status(500).send({ error: 'Erro ao buscar dados externos' });
    }
  }
}

export { loginAPIController };