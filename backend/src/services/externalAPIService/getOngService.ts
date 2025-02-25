import prismaClient from "../../prisma";

class GetOngService {
  async execute() {
    const ngos = await prismaClient.ngo.findMany();
    return ngos;
  }
}

export { GetOngService };
