import { User as UserModel } from '../../../../../models/user.model';
import { User, UserProps } from "@modules/user";
import { CustomError } from "@shared/customError";
import { DeleteFileService } from "@modules/file";
import S3Storage from "@shared/s3Storage";
import mongoose from 'mongoose';

class UserRepository {
  private deleteFileService: DeleteFileService;
  private s3Storage: S3Storage;

  constructor(deleteFileService: DeleteFileService, s3Storage: S3Storage) {
    this.deleteFileService = deleteFileService;
    this.s3Storage = s3Storage;
  }

  async findById(id: string): Promise<User | null> {
    try {
      const user = await UserModel.findById(id);
      
      if (!user) return null;
      
      // Criar uma instância de User incluindo o profileUrl
      const userInstance = new User({
        name: user.name,
        email: user.email,
        ngoId: user.ngoId
      }, id);
      
      // Adicionar explicitamente o profileUrl
      userInstance.profileUrl = user.profileUrl;
      
      return userInstance;
    } catch (error) {
      if (error instanceof Error) {
        throw new CustomError(`Erro ao buscar usuário: ${error.message}`, 400);
      }
      throw new CustomError("Erro ao buscar usuário", 400);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await UserModel.findOne({ email });
      if (!user) return null;
      
      // Criar uma instância de User incluindo o profileUrl
      const userInstance = new User({
        name: user.name,
        email: user.email,
        ngoId: user.ngoId
      }, user._id.toString());
      
      // Adicionar explicitamente o profileUrl
      userInstance.profileUrl = user.profileUrl;
      
      return userInstance;
    } catch (error) {
      if (error instanceof mongoose.Error) {
        throw new CustomError("Erro ao buscar usuário por email", 400);
      }
      throw error;
    }
  }

  async create(data: UserProps): Promise<User> {
    try {
      const newUser = new UserModel({
        ...data,
        profileUrl: "", // Inicializa com string vazia
      });
      
      const savedUser = await newUser.save();
      
      // Criar uma instância de User incluindo o profileUrl
      const userInstance = new User({
        name: savedUser.name,
        email: savedUser.email,
        ngoId: savedUser.ngoId
      }, savedUser._id.toString());
      
      // Adicionar explicitamente o profileUrl
      userInstance.profileUrl = savedUser.profileUrl;
      
      return userInstance;
    } catch (error) {
      if (error instanceof Error) {
        throw new CustomError(`Erro ao criar usuário: ${error.message}`, 400);
      }
      throw new CustomError("Erro ao criar usuário", 400);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Buscar o usuário para obter informações necessárias
      const user = await this.findById(id);

      if (!user) {
        throw new CustomError("Usuário não encontrado", 404);
      }

      // Se o usuário tem uma foto de perfil, excluir a pasta inteira do usuário
      if (user.profileUrl) {
        try {
          // Usar a nova abordagem: excluir a pasta inteira do usuário
          await this.s3Storage.deleteFolder(`${user.ngoId}/users/${id}`);
          console.log(`Pasta do usuário ${id} excluída com sucesso`);
        } catch (s3Error) {
          console.error(`Erro ao excluir pasta do usuário ${id}:`, s3Error);
          // Continuar com a exclusão do registro no banco mesmo se falhar no S3
        }
      }

      // Deletar o usuário
      await UserModel.findByIdAndDelete(id);
    } catch (error) {
      if (error instanceof Error) {
        throw new CustomError(`Erro ao excluir usuário: ${error.message}`, 400);
      }
      throw new CustomError("Erro ao excluir usuário", 400);
    }
  }

  async updateProfile(id: string, profileUrl: string): Promise<User> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        id, 
        { profileUrl }, 
        { new: true } // Return the updated document
      );
      
      if (!updatedUser) {
        throw new CustomError("Usuário não encontrado", 404);
      }
      
      // Criar uma instância de User incluindo o profileUrl
      const userInstance = new User({
        name: updatedUser.name,
        email: updatedUser.email,
        ngoId: updatedUser.ngoId
      }, updatedUser._id.toString());
      
      // Adicionar explicitamente o profileUrl
      userInstance.profileUrl = updatedUser.profileUrl;
      
      return userInstance;
    } catch (error) {
      if (error instanceof Error) {
        throw new CustomError(`Erro ao atualizar perfil: ${error.message}`, 400);
      }
      throw new CustomError("Erro ao atualizar perfil", 400);
    }
  }

  async deleteAllFromNgo(ngoId: number): Promise<void> {
    try {
      // Buscar todos os usuários da ONG
      const users = await UserModel.find({ ngoId });
      
      // Para cada usuário, excluir sua pasta de arquivos
      for (const user of users) {
        try {
          // Excluir a pasta inteira do usuário usando a nova abordagem
          await this.s3Storage.deleteFolder(`${ngoId}/users/${user._id}`);
          console.log(`Pasta do usuário ${user._id} excluída com sucesso`);
        } catch (s3Error) {
          console.error(`Erro ao excluir pasta do usuário ${user._id}:`, s3Error);
          // Continuar com os próximos usuários
        }
      }
      
      // Excluir todos os registros de usuários da ONG
      await UserModel.deleteMany({ ngoId });
    } catch (error) {
      console.error("Erro ao excluir usuários da ONG:", error);
      throw new CustomError("Erro ao excluir usuários da ONG", 400);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await UserModel.find();
      
      return users.map(user => {
        // Criar uma instância de User incluindo o profileUrl
        const userInstance = new User({
          name: user.name,
          email: user.email,
          ngoId: user.ngoId
        }, user._id.toString());
        
        // Adicionar explicitamente o profileUrl
        userInstance.profileUrl = user.profileUrl;
        
        return userInstance;
      });
    } catch (error) {
      throw new CustomError("Erro ao buscar todos os usuários", 500);
    }
  }

  async updateProfilePhoto(userId: string, ngoId: number, fileBuffer: Buffer, filename: string): Promise<string> {
    try {
      // Construir o caminho para a pasta do usuário
      const path = this.s3Storage.buildPath(ngoId, 'users', userId);
      
      // Verificar se já existe uma foto de perfil e excluí-la
      const user = await UserModel.findById(userId);
      
      if (user && user.profileUrl) {
        try {
          await this.s3Storage.deleteFile(user.profileUrl);
        } catch (error) {
          console.error(`Erro ao excluir foto de perfil antiga do usuário ${userId}:`, error);
        }
      }
      
      // Salvar a nova foto de perfil
      const aws_url = await this.s3Storage.saveFile(fileBuffer, filename, path);
      
      // Atualizar o registro do usuário com a nova URL
      await UserModel.findByIdAndUpdate(userId, { profileUrl: aws_url });
      
      return aws_url;
    } catch (error) {
      console.error(`Erro ao atualizar foto de perfil do usuário ${userId}:`, error);
      throw new CustomError("Erro ao atualizar foto de perfil", 500);
    }
  }

  async deleteProfilePhoto(userId: string, ngoId: number): Promise<void> {
    try {
      // Excluir todos os arquivos da pasta do usuário
      await this.s3Storage.deleteFolder(`${ngoId}/users/${userId}`);
      
      // Atualizar o registro do usuário para remover a URL
      await UserModel.findByIdAndUpdate(userId, { profileUrl: null });
    } catch (error) {
      console.error(`Erro ao excluir foto de perfil do usuário ${userId}:`, error);
      throw new CustomError("Erro ao excluir foto de perfil", 500);
    }
  }
}

export { UserRepository };