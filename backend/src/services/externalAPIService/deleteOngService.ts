import prismaClient from "../../prisma";

interface DeleteOngProps {
  id: string;
}

class DeleteOngService {
  async execute({ id }: DeleteOngProps) {
    const ngo = await prismaClient.ngo.findUnique({
      where: { id: parseInt(id) },
    });

    if (!ngo) {
      throw new Error("ONG não encontrada");
    }

    await prismaClient.ngo.delete({
      where: { id: parseInt(id) },
    });
  }
}

export { DeleteOngService };
