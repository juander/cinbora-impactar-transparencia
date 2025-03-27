import { FastifyRequest, FastifyReply } from "fastify";
import { LogService } from "@modules/log/application/services/LogService";

class LogController {
  private logService: LogService;

  constructor(logService: LogService) {
    this.logService = logService;
  }

  // método para obter apenas o último log da ONG
  async getLastLogByNgoId(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Corrigido: parâmetros de URL vêm como strings
      const { ngoId } = request.params as { ngoId: string };
      
      if (!ngoId) {
        return reply.status(400).send({ error: "ID da ONG não fornecido" });
      }

      const parsedNgoId = parseInt(ngoId, 10);
      
      if (isNaN(parsedNgoId)) {
        return reply.status(400).send({ error: "ID da ONG inválido" });
      }
  
      const log = await this.logService.getLastLogByNgoId(parsedNgoId);
      
      if (!log) {
        return reply.status(404).send({ error: "Nenhum log encontrado para esta ONG" });
      }
      
      return reply.status(200).send(log);
    } catch (error) {
      console.error("Erro ao buscar o último log:", error);
      return reply.status(500).send({ error: "Erro ao buscar o último log" });
    }
  }

  // Método para usar o ngoId do token
  async getOngLogs(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user || !request.user.ngoId) {
      return reply.status(401).send({ error: "Usuário não autenticado ou sem permissão" });
    }

    try {
      const logs = await this.logService.getLogsByNgoId(request.user.ngoId);
      reply.send(logs);
    } catch (error) {
      console.error("Erro ao obter logs da ONG:", error);
      reply.status(500).send({ error: "Erro ao obter logs da ONG" });
    }

  }
}

export { LogController };