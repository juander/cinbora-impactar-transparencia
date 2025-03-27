import { Log } from "../entities/Log";
import prismaClient from "@shared/prismaClient";

class LogRepository {
  async create(log: Log): Promise<void> {
    await prismaClient.log.create({
      data: log,
    });
  }

  async findByNgoId(ngoId: number): Promise<Log[]> {
    const logs = await prismaClient.log.findMany({
      where: {
        ngoId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
    return logs;
  }

async getLastLogByNgoId(ngoId: number): Promise<Log | null> {
  const log = await prismaClient.log.findFirst({
    where: {
      ngoId
    },
    orderBy: {
      timestamp: 'desc'
    }
  });
  
  return log;
}
}

export { LogRepository };