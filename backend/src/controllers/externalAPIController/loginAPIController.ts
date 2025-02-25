import { FastifyRequest, FastifyReply } from "fastify";
import { GetOngDataService } from "../../services/externalAPIService/loginAPIService";
import prismaClient from "../../infrastructure/prisma"

class LoginAPIController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as { email: string; password: string };

    const getOngDataService = new GetOngDataService();

    try {
      const data = await getOngDataService.execute({ email, password });

      if (!data.ngo) {
        return reply.status(400).send({ error: "Nenhuma ONG encontrada para este usuário." });
      }

      const ngoData = data.ngo;
      const userData = data.user;

      // Verificar se a ONG já existe pelo ID
      let ngo = await prismaClient.ngo.findUnique({
        where: { id: ngoData.id }
      });

      if (!ngo) {
        // Criar a ONG no banco apenas se não existir
        ngo = await prismaClient.ngo.create({
          data: {
            id: ngoData.id, 
            name: ngoData.name,
            description: ngoData.description,
            is_formalized: ngoData.is_formalized,
            start_year: ngoData.start_year,
            contact_phone: ngoData.contact_phone,
            instagram_link: ngoData.instagram_link,
            x_link: ngoData.x_link,
            facebook_link: ngoData.facebook_link,
            pix_qr_code_link: ngoData.pix_qr_code_link,
            gallery_images_url: ngoData.gallery_images_url,
          },
        });
      }

      // Verificar se o usuário já existe pelo email
      let user = await prismaClient.user.findUnique({
        where: { email: userData.email }
      });

      if (!user) {
        // Criar o usuário no banco apenas se não existir
        user = await prismaClient.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            ngoId: ngo.id
          }
        });
      }

      reply.send({ message: data.message, user, ngo });
    } catch (error) {
      console.error("Erro no login:", error);
      reply.status(500).send({ error: "Erro ao processar login" });
    }
  }
}

export { LoginAPIController };
