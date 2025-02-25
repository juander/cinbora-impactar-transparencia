import prismaClient from "../../infrastructure/prisma"

class GetOngService {
  async execute() {
    const ngos = await prismaClient.ngo.findMany();
    return ngos;
  }
}

export { GetOngService };
