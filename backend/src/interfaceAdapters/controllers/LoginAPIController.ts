import { FastifyRequest, FastifyReply } from "fastify";
import { GetOngDataUseCase } from "../../application/useCases/GetOngDataUseCase";
import { CreateUserAndNgoUseCase } from "../../application/useCases/CreateUserAndNgoUseCase";

class LoginAPIController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as { email: string; password: string };

    const getOngDataUseCase = new GetOngDataUseCase();
    const createUserAndNgoUseCase = new CreateUserAndNgoUseCase();

    try {
      const data = await getOngDataUseCase.execute({ email, password });

      if (!data.ngo) {
        return reply.status(400).send({ error: "Nenhuma ONG encontrada para este usuário." });
      }

      const ngoData = data.ngo;
      const userData = data.user;

      const result = await createUserAndNgoUseCase.execute({
        user: userData,
        ngo: ngoData,
      });

      reply.send({ message: data.message, user: result.user, ngo: result.ngo });
    } catch (error) {
      console.error("Erro no login:", error);
      reply.status(500).send({ error: "Erro ao processar login" });
    }
  }
}

export { LoginAPIController };
