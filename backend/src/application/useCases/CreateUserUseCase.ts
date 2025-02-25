import prismaClient from "../../infrastructure/prisma";

interface CreateUserProps {
  name: string;
  email: string;
  ngoId: number;
}

class CreateUserUseCase {
  async execute({ name, email, ngoId }: CreateUserProps) {
    const user = await prismaClient.user.create({
      data: {
        name,
        email,
        ngoId,
      },
    });

    return user;
  }
}

export { CreateUserUseCase };
