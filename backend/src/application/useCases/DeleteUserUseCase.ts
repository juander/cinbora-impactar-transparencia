import prismaClient from "../../infrastructure/prisma";

interface DeleteUserProps {
  id:string;
}

class DeleteUserUseCase {
  async execute({ id }: DeleteUserProps) {
    const user = await prismaClient.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    await prismaClient.user.delete({
      where: { id },
    });
  }
}

export { DeleteUserUseCase };
