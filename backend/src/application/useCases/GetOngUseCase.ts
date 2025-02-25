import prismaClient from "../../infrastructure/prisma";

class GetOngUseCase {
  async execute() {
    const ngos = await prismaClient.ngo.findMany();
    return ngos;
  }
}

export { GetOngUseCase };
