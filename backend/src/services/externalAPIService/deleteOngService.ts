import prismaClient from "../../infrastructure/prisma";

interface DeleteOngProps {
  id: string;
}

class DeleteOngService {
  async execute({ id }: DeleteOngProps) {
    const ngoId = parseInt(id);

    const ngo = await prismaClient.ngo.findUnique({
      where: { id: ngoId },
    });

    if (!ngo) {
      throw new Error("ONG não encontrada");
    }

    // Excluir todos os usuários associados à ONG
    await prismaClient.user.deleteMany({
      where: { ngoId: ngoId },
    });

    // Excluir a ONG
    await prismaClient.ngo.delete({
      where: { id: ngoId },
    });
  }
}

export { DeleteOngService };
