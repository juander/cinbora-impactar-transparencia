import { FastifyRequest, FastifyReply } from "fastify";
import { GetOngDataService } from "../../services/externalAPIService/loginAPIService";
import prismaClient from "../../prisma/prismaClient";

class loginAPIController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as { email: string; password: string };

    const getOngDataService = new GetOngDataService();

    try {
      const data = await getOngDataService.execute({ email, password });

      // Extrair os dados da ONG da resposta da API externa
      const ngoData = data.ngo;

      // Criar a ONG no banco de dados usando Prisma
      const ngo = await prismaClient.ngo.create({
        data: {
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
          skills: ngoData.skills,
          causes: ngoData.causes,
          sustainable_development_goals: ngoData.sustainable_development_goals,
        },
      });

      // Enviar a resposta com os dados da ONG criada
      reply.send({ message: data.message, ngo });
    } catch (error) {
      reply.status(500).send({ error: 'Erro ao buscar dados externos' });
    }
  }
}

export { loginAPIController };