import { LogRepository, Log } from "@modules/log";

class LogService {
  private logRepository: LogRepository;

  constructor(logRepository: LogRepository) {
    this.logRepository = logRepository;
  }

  async logAction(ngoId: number, userId: string, userName: string, action: string, model: string, modelId: string, changes: any, description: string) {
    const now = new Date();
    const brazilianDate = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    
    const log: Log = {
      ngoId,
      userId,
      userName,
      action,
      model,
      modelId,
      changes,
      description,
      timestamp: brazilianDate,
    };

    await this.logRepository.create(log);
  }

  async getLogsByNgoId(ngoId: number) {
    return this.logRepository.findByNgoId(ngoId);
  }

  // Método para obter apenas o último log de uma ONG
  async getLastLogByNgoId(ngoId: number) {
    try {
      const log = await this.logRepository.getLastLogByNgoId(ngoId);
      return log;
    } catch (error) {
      throw new Error("Erro ao buscar o último log da ONG");
    }
  }
}

export { LogService };