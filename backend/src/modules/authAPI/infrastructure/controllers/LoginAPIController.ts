import { FastifyRequest, FastifyReply } from "fastify";
import { AuthController } from "@modules/authAPI";

class LoginAPIController {
  private readonly authController: AuthController;

  constructor(authController: AuthController) {
    this.authController = authController;
  }

  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = request.body as { email: string; password: string };
      
      const authResult = await this.authController.authenticate(email, password);
      
      // Garantir que a resposta siga o formato esperado pelo schema
      const response = {
        message: "Login bem-sucedido", 
        token: authResult.token,
        user: authResult.user,
        ngo: authResult.ngo,
        actions: authResult.actions || []
      };
      
      return reply.send(response);
    } catch (error: any) {
      return reply.status(error.statusCode || 500).send({ error: error.message });
    }
  }
}

export { LoginAPIController };