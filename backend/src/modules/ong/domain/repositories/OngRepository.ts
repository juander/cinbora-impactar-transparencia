import prismaClient from "@shared/prismaClient";
import { Ong, OngProps } from "@modules/ong";
import { CustomError } from "@shared/customError";
import s3StorageInstance from "@shared/s3Cliente";
import { Prisma } from "@prisma/client";
import { UserRepository } from "@modules/user";

class OngRepository {
  private s3Storage = s3StorageInstance;
  private userRepository: UserRepository;
  
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async findById(id: string): Promise<Ong | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (isNaN(numericId) || numericId <= 0) {
      throw new CustomError('ID inválido', 400);
    }

    try {
      const ong = await prismaClient.ngo.findUnique({ where: { id: numericId } });
      if (!ong) return null;
      return new Ong(ong, ong.id);
    } catch (error) {
      console.error("Erro ao buscar ONG por ID:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao buscar ONG por ID", 400);
      }
      throw new CustomError("Erro ao buscar ONG", 500);
    }
  }

  async findAll(): Promise<Ong[]> {
    try {
      const ongs = await prismaClient.ngo.findMany();
      return ongs.map(ong => new Ong(ong, ong.id));
    } catch (error) {
      console.error("Erro ao buscar todas as ONGs:", error);
      throw new CustomError("Erro ao buscar todas as ONGs", 500);
    }
  }

  async create(data: Ong): Promise<Ong> {
    try {
      // Criando primeiro a ONG
      const ong = await prismaClient.ngo.create({
        data: {
          id: data.id,
          name: data.name,
          description: data.description,
          is_formalized: data.is_formalized,
          start_year: data.start_year,
          contact_phone: data.contact_phone,
          instagram_link: data.instagram_link,
          x_link: data.x_link,
          facebook_link: data.facebook_link,
          pix_qr_code_link: data.pix_qr_code_link,
          site: data.site,
          gallery_images_url: data.gallery_images_url,
          skills: data.skills,
          causes: data.causes,
          sustainable_development_goals: data.sustainable_development_goals,
        },
      });

      // Depois criando os gráficos associados à ONG
      await prismaClient.ngoGraphic.create({
        data: {
          ngoId: data.id,
          totalExpenses: 0,
          expensesByAction: [],
        },
      });

      return new Ong(ong, ong.id);
    } catch (error) {
      console.error("Erro ao criar ONG:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao criar ONG", 400);
      }
      throw new CustomError("Erro ao criar ONG", 500);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const numericId = parseInt(id);
      
      if (isNaN(numericId)) {
        throw new CustomError("ID de ONG inválido", 400);
      }

      try {
        // Isso exclui TUDO no caminho /{ongId}/... incluindo todas as subpastas
        await this.s3Storage.deleteFolder(`${numericId}`);
        console.log(`Todos os arquivos da ONG ${numericId} foram excluídos com sucesso`);
      } catch (s3Error) {
        console.error(`Erro ao excluir arquivos da ONG ${numericId}:`, s3Error);
        // Continuamos com a deleção dos registros no banco mesmo se falhar no S3
      }
      
      const ong = await prismaClient.ngo.findUnique({
        where: { id: numericId },
        include: {
          actions: {
            select: { id: true }
          }
        }
      });

      if (!ong) {
        throw new CustomError("ONG não encontrada", 404);
      }

      // 1. Primeiro, deletar ActionExpensesGrafic (que depende de Action)
      for (const action of ong.actions) {
        await prismaClient.actionExpensesGrafic.deleteMany({
          where: { actionId: action.id }
        });
      }

      // 2. Deletar os usuários associados à ONG
      await prismaClient.user.deleteMany({
        where: { ngoId: numericId }
      });

      // 3. Deletar o restante em uma ordem que respeite as relações
      await prismaClient.actionFile.deleteMany({
        where: { ngoId: numericId }
      });

      await prismaClient.action.deleteMany({
        where: { ngoId: numericId }
      });

      await prismaClient.ongFile.deleteMany({
        where: { ngoId: numericId }
      });

      await prismaClient.ngoGraphic.deleteMany({
        where: { ngoId: numericId }
      });
      
      // Adicionado: Deletar todos os logs associados à ONG
      await prismaClient.log.deleteMany({
        where: { ngoId: numericId }
      });

      // 4. Finalmente deletar a ONG
      await prismaClient.ngo.delete({
        where: { id: numericId }
      });
    } catch (error) {
      console.error("Erro ao deletar ONG:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao deletar ONG", 400);
      }
      throw new CustomError("Erro ao deletar ONG", 500);
    }
  }

  async update(ngoId: number, data: Partial<OngProps>): Promise<OngProps> {
    const existingNgo = await prismaClient.ngo.findUnique({ where: { id: ngoId } });

    if (!existingNgo) {
      throw new CustomError('ONG não encontrada', 404);
    }

    try {
      const updatedOng = await prismaClient.ngo.update({
        where: { id: ngoId },
        data,
      });
      return updatedOng;
    } catch (error) {
      console.error("Erro ao atualizar ONG:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao atualizar ONG", 400);
      }
      throw new CustomError("Erro ao atualizar ONG", 500);
    }
  }

  async updateNgoGrafic(ngoId: number, data: Partial<{ totalExpenses: number; expensesByCategory: Record<string, number> }>): Promise<any> {
    const existingGrafic = await prismaClient.ngoGraphic.findUnique({ where: { ngoId } });

    if (!existingGrafic) {
      throw new CustomError('Gráfico não encontrado', 404);
    }

    const updatedExpensesByCategory = {
      ...data.expensesByCategory,
    };

    try {
      const updatedGrafic = await prismaClient.ngoGraphic.update({
        where: { ngoId },
        data: {
          totalExpenses: data.totalExpenses ?? existingGrafic.totalExpenses,
          expensesByAction: updatedExpensesByCategory,
        },
      });

      return updatedGrafic;
    } catch (error) {
      console.error("Erro ao atualizar gráfico da ONG:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao atualizar gráfico da ONG", 400);
      }
      throw new CustomError("Erro ao atualizar gráfico da ONG", 500);
    }
  }

  async findGraficByNgoId(ngoId: string): Promise<any> {
    try {
      return prismaClient.ngoGraphic.findFirst({
        where: { ngoId: parseInt(ngoId) },
      });
    } catch (error) {
      console.error("Erro ao obter gráfico da ONG:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao obter gráfico da ONG", 400);
      }
      throw new CustomError("Erro ao obter gráfico da ONG", 500);
    }
  }
}

export { OngRepository };