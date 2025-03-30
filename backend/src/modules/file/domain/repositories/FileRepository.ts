import { OngFile as OngFileModel } from '../../../../../models/ong-file.model';
import { ActionFile as ActionFileModel } from '../../../../../models/action-file.model';
import { Action as ActionModel } from '../../../../../models/action.model';
import { OngFileEntity, OngFileProps, ActionFileEntity, ActionFileProps } from "@modules/file";
import s3StorageInstance from "@shared/s3Cliente";
import { CustomError } from "@shared/customError";
import mongoose from 'mongoose';

class FileRepository {
  private s3Storage = s3StorageInstance;

  async saveFile(fileBuffer: Buffer, filename: string, ngoId?: number, actionId?: string): Promise<string> {
    try {
      let path;
      
      // Se tiver tanto ngoId quanto actionId, cria o mesmo path usado em createActionFile
      if (ngoId && actionId) {
        path = this.s3Storage.buildPath(ngoId, 'actions', actionId);
      }
      
      return this.s3Storage.saveFile(fileBuffer, filename, path);
    } catch {
      throw new CustomError("Erro ao salvar arquivo no S3", 500);
    }
  }

  async createOngFile(fileBuffer: Buffer, fileProps: OngFileProps): Promise<OngFileEntity> {
    try {
      // Construir caminho para arquivos da ONG
      const path = this.s3Storage.buildPath(fileProps.ngoId, 'files');
      
      // Salvar arquivo com o novo caminho - agora retorna URL já codificada corretamente
      const aws_url = await this.s3Storage.saveFile(fileBuffer, fileProps.name, path);
      
      // O aws_name agora contém o caminho completo após amazonaws.com/
      // A URL já está codificada consistentemente pelo método saveFile
      const aws_name = aws_url.split('amazonaws.com/')[1];

      // Criar um novo documento usando o modelo Mongoose
      const newOngFile = new OngFileModel({ 
        ...fileProps, 
        aws_name,
        aws_url, // URL já está codificada corretamente
        size: fileProps.size
      });

      // Salvar o novo documento
      const file = await newOngFile.save();

      return new OngFileEntity(
        {
          name: file.name,
          aws_name: file.aws_name,
          category: file.category,
          aws_url: file.aws_url,
          ngoId: file.ngoId,
          mime_type: file.mime_type,
          size: file.size
        }, 
        file._id.toString()
      );
    } catch (error) {
      console.error("Erro ao criar arquivo da ONG:", error);
      if (error instanceof mongoose.Error) {
        throw new CustomError("Erro ao criar arquivo da ONG no banco de dados", 400);
      }
      throw new CustomError("Erro ao criar arquivo da ONG", 500);
    }
  }

  async createActionFile(fileBuffer: Buffer, fileProps: ActionFileProps): Promise<ActionFileEntity> {
    try {
      // Primeiro, obtenha o ngoId associado a esta ação
      const action = await ActionModel.findById(fileProps.actionId);
      
      if (!action) {
        throw new CustomError("Ação não encontrada", 404);
      }
      
      // Construir caminho para arquivos da ação
      const path = this.s3Storage.buildPath(action.ngoId, 'actions', fileProps.actionId);
      
      // Salvar arquivo com o novo caminho - agora retorna URL já codificada corretamente
      const aws_url = await this.s3Storage.saveFile(fileBuffer, fileProps.name, path);
      
      // O aws_name agora contém o caminho completo
      // A URL já está codificada consistentemente pelo método saveFile
      const aws_name = aws_url.split('amazonaws.com/')[1];

      // Criar um novo documento usando o modelo Mongoose
      const newActionFile = new ActionFileModel({ 
        ...fileProps, 
        aws_name,
        aws_url, // URL já está codificada corretamente
        size: fileProps.size,
        ngoId: action.ngoId
      });

      // Salvar o novo documento
      const file = await newActionFile.save();

      return new ActionFileEntity(
        {
          name: file.name,
          aws_name: file.aws_name,
          category: file.category,
          aws_url: file.aws_url,
          actionId: file.actionId.toString(),
          ngoId: file.ngoId,
          mime_type: file.mime_type,
          size: file.size
        }, 
        file._id.toString()
      );
    } catch (error) {
      console.error("Erro ao criar arquivo da ação:", error);
      if (error instanceof mongoose.Error) {
        throw new CustomError("Erro ao criar arquivo da ação no banco de dados", 400);
      }
      throw new CustomError("Erro ao criar arquivo da ação", 500);
    }
  }

  async delete(id: string): Promise<{ category: string, name: string, actionId?: string }> {
    try {
      // Verificar primeiro se é um arquivo de ONG
      const ongFile = await OngFileModel.findById(id);

      if (ongFile) {
        await this.s3Storage.deleteFile(ongFile.aws_name);
        await OngFileModel.findByIdAndDelete(id);
        return {
          category: ongFile.category,
          name: ongFile.name
        };
      }

      // Se não for, verificar se é um arquivo de Action
      const actionFile = await ActionFileModel.findById(id);

      if (actionFile) {
        await this.s3Storage.deleteFile(actionFile.aws_name);
        await ActionFileModel.findByIdAndDelete(id);
        return {
          category: actionFile.category,
          name: actionFile.name,
          actionId: actionFile.actionId.toString()
        };
      }
      
      throw new CustomError("Arquivo não encontrado", 404);
    } catch (error) {
      console.error("Erro ao deletar arquivo:", error);
      if (error instanceof mongoose.Error) {
        throw new CustomError("Erro ao deletar arquivo do banco de dados", 400);
      }
      throw new CustomError("Erro ao deletar arquivo", 500);
    }
  }

  async deleteFileFromS3(filename: string): Promise<void> {
    try {
      await this.s3Storage.deleteFile(filename);
    } catch (error) {
      console.error("Erro ao deletar arquivo no S3:", error);
      throw new CustomError("Erro ao deletar arquivo no S3", 500);
    }
  }

  async findActionFilesByCategory(actionId: string, category: string): Promise<ActionFileEntity[]> {
    try {
      const files = await ActionFileModel.find({
        actionId,
        category,
      });

      return files.map(file => new ActionFileEntity(
        {
          name: file.name,
          aws_name: file.aws_name,
          category: file.category,
          aws_url: file.aws_url,
          actionId: file.actionId.toString(),
          ngoId: file.ngoId,
          mime_type: file.mime_type,
          size: file.size
        }, 
        file._id.toString()
      ));
    } catch (error) {
      console.error("Erro ao buscar arquivos da ação por categoria:", error);
      if (error instanceof mongoose.Error) {
        throw new CustomError("Erro ao buscar arquivos da ação por categoria", 400);
      }
      throw new CustomError("Erro ao buscar arquivos da ação por categoria", 500);
    }
  }

  async findOngFilesByCategory(ngoId: string, category: string): Promise<OngFileEntity[]> {
    try {
      const files = await OngFileModel.find({
        ngoId: parseInt(ngoId),
        category,
      });

      return files.map(file => new OngFileEntity(
        {
          name: file.name,
          aws_name: file.aws_name,
          category: file.category,
          aws_url: file.aws_url,
          ngoId: file.ngoId,
          mime_type: file.mime_type,
          size: file.size
        }, 
        file._id.toString()
      ));
    } catch (error) {
      console.error("Erro ao buscar arquivos da ONG por categoria:", error);
      if (error instanceof mongoose.Error) {
        throw new CustomError("Erro ao buscar arquivos da ONG por categoria", 400);
      }
      throw new CustomError("Erro ao buscar arquivos da ONG por categoria", 500);
    }
  }

  async deleteEntityFiles(type: 'ong' | 'action' | 'user', entityId: string | number, ngoId: number): Promise<number> {
    try {
      let path: string;
      
      switch (type) {
        case 'ong':
          path = `${ngoId}`;
          break;
        case 'action':
          path = `${ngoId}/actions/${entityId}`;
          break;
        case 'user':
          path = `${ngoId}/users/${entityId}`;
          break;
      }
      
      return await this.s3Storage.deleteFolder(path);
    } catch (error) {
      console.error(`Erro ao excluir arquivos de ${type} ${entityId}:`, error);
      throw new CustomError(`Erro ao excluir arquivos de ${type}`, 500);
    }
  }
}

export { FileRepository };