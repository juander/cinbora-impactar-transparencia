import { Log as LogModel } from "../../../../../models/log.model";
import { Log } from "../entities/Log";
import { CustomError } from "@shared/customError";

class LogRepository {
  async create(log: Log): Promise<void> {
    try {
      const newLog = new LogModel({
        ngoId: log.ngoId,
        userId: log.userId,
        userName: log.userName,
        action: log.action,
        modelName: log.model, 
        modelId: log.modelId,
        changes: log.changes,
        description: log.description,
        timestamp: log.timestamp || new Date()
      });
      
      await newLog.save();
    } catch (error) {
      console.error("Erro ao criar log:", error);
      throw new CustomError("Erro ao criar log", 500);
    }
  }

  async findByNgoId(ngoId: number): Promise<Log[]> {
    try {
      const logs = await LogModel.find({
        ngoId
      }).sort({ timestamp: -1 }); // -1 for descending order
      
      // Convert Mongoose documents to Log domain entities
      return logs.map(log => ({
        ngoId: log.ngoId,
        userId: log.userId.toString(), // Convert ObjectId to string
        userName: log.userName,
        action: log.action,
        model: log.modelName, // Map the field back to match the entity
        modelId: log.modelId,
        changes: log.changes,
        description: log.description,
        timestamp: log.timestamp
      }));
    } catch (error) {
      console.error("Erro ao buscar logs da ONG:", error);
      throw new CustomError("Erro ao buscar logs da ONG", 500);
    }
  }

  async getLastLogByNgoId(ngoId: number): Promise<Log | null> {
    try {
      const log = await LogModel.findOne({
        ngoId
      }).sort({ timestamp: -1 }).limit(1);
      
      if (!log) return null;
      
      // Convert to Log domain entity
      return {
        ngoId: log.ngoId,
        userId: log.userId.toString(), // Convert ObjectId to string
        userName: log.userName,
        action: log.action,
        model: log.modelName, // Map the field back to match the entity
        modelId: log.modelId,
        changes: log.changes,
        description: log.description,
        timestamp: log.timestamp
      };
    } catch (error) {
      console.error("Erro ao buscar último log da ONG:", error);
      throw new CustomError("Erro ao buscar último log da ONG", 500);
    }
  }
}

export { LogRepository };