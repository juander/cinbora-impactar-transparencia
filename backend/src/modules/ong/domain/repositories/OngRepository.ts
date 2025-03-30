import { Ngo as NgoModel } from '../../../../../models/ngo.model';
import { NgoGraphic as NgoGraphicModel } from '../../../../../models/ngo-graphic.model';
import { OngFile as OngFileModel } from '../../../../../models/ong-file.model';
import { Action as ActionModel } from '../../../../../models/action.model';
import { ActionFile as ActionFileModel } from '../../../../../models/action-file.model';
import { ActionExpensesGrafic as ActionExpensesGraficModel } from '../../../../../models/action-expenses-grafic.model';
import { Log as LogModel } from '../../../../../models/log.model';
import { Ong, OngProps } from "@modules/ong";
import { CustomError } from "@shared/customError";
import s3StorageInstance from "@shared/s3Cliente";
import { UserRepository } from "@modules/user";

class OngRepository {
  private s3Storage = s3StorageInstance;
  private userRepository: UserRepository;
  
  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  // Helper method to convert Mongoose document to OngProps
  private mapToOngProps(ong: any): OngProps {
    // Extract base document
    const doc = ong.toObject ? ong.toObject() : ong;
    
    // Map _id to id and ensure all required fields are present
    return {
      id: doc._id,
      name: doc.name,
      description: doc.description,
      is_formalized: doc.is_formalized,
      start_year: doc.start_year !== undefined ? doc.start_year : null,
      contact_phone: doc.contact_phone !== undefined ? doc.contact_phone : null,
      instagram_link: doc.instagram_link !== undefined ? doc.instagram_link : null,
      x_link: doc.x_link !== undefined ? doc.x_link : null,
      facebook_link: doc.facebook_link !== undefined ? doc.facebook_link : null,
      pix_qr_code_link: doc.pix_qr_code_link !== undefined ? doc.pix_qr_code_link : null,
      site: doc.site !== undefined ? doc.site : null,
      gallery_images_url: doc.gallery_images_url || [],
      skills: doc.skills || {},
      causes: doc.causes || {},
      sustainable_development_goals: doc.sustainable_development_goals || {}
    };
  }

  async findById(id: string): Promise<Ong | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (isNaN(numericId) || numericId <= 0) {
      throw new CustomError('ID inválido', 400);
    }

    try {
      const ong = await NgoModel.findById(numericId);
      if (!ong) return null;
      
      // Use the helper method to convert to OngProps
      const ongProps = this.mapToOngProps(ong);
      
      return new Ong(ongProps, numericId);
    } catch (error) {
      console.error("Erro ao buscar ONG por ID:", error);
      throw new CustomError("Erro ao buscar ONG", 500);
    }
  }

  async findAll(): Promise<Ong[]> {
    try {
      const ongs = await NgoModel.find();
      return ongs.map(ong => {
        // Use the helper method to convert to OngProps
        const ongProps = this.mapToOngProps(ong);
        return new Ong(ongProps, ong._id);
      });
    } catch (error) {
      console.error("Erro ao buscar todas as ONGs:", error);
      throw new CustomError("Erro ao buscar todas as ONGs", 500);
    }
  }

  async create(data: Ong): Promise<Ong> {
    try {
      const newNgo = new NgoModel({
        _id: data.id,
        name: data.name,
        description: data.description,
        is_formalized: data.is_formalized,
        start_year: data.start_year,
        contact_phone: data.contact_phone,
        instagram_link: data.instagram_link,
        x_link: data.x_link,
        facebook_link: data.facebook_link,
        pix_qr_code_link: data.pix_qr_code_link,
        site: data.site,
        gallery_images_url: data.gallery_images_url,
        skills: data.skills,
        causes: data.causes,
        sustainable_development_goals: data.sustainable_development_goals,
      });
      
      const savedNgo = await newNgo.save();

      const newNgoGraphic = new NgoGraphicModel({
        ngoId: data.id,
        totalExpenses: 0,
        expensesByAction: [],
      });
      
      await newNgoGraphic.save();

      // Use the helper method to convert to OngProps
      const ongProps = this.mapToOngProps(savedNgo);
      
      return new Ong(ongProps, savedNgo._id);
    } catch (error) {
      console.error("Erro ao criar ONG:", error);
      throw new CustomError("Erro ao criar ONG", 500);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const numericId = parseInt(id);
      
      if (isNaN(numericId)) {
        throw new CustomError("ID de ONG inválido", 400);
      }

      try {
        await this.s3Storage.deleteFolder(`${numericId}`);
        console.log(`Todos os arquivos da ONG ${numericId} foram excluídos com sucesso`);
      } catch (s3Error) {
        console.error(`Erro ao excluir arquivos da ONG ${numericId}:`, s3Error);
      }
      
      const ong = await NgoModel.findById(numericId);

      if (!ong) {
        throw new CustomError("ONG não encontrada", 404);
      }

      const actions = await ActionModel.find({ ngoId: numericId });
      const actionIds = actions.map(action => action._id);

      await ActionExpensesGraficModel.deleteMany({
        actionId: { $in: actionIds }
      });

      await this.userRepository.deleteAllFromNgo(numericId);

      await ActionFileModel.deleteMany({
        ngoId: numericId
      });

      await ActionModel.deleteMany({
        ngoId: numericId
      });

      await OngFileModel.deleteMany({
        ngoId: numericId
      });

      await NgoGraphicModel.deleteMany({
        ngoId: numericId
      });
      
      await LogModel.deleteMany({
        ngoId: numericId
      });

      await NgoModel.findByIdAndDelete(numericId);
    } catch (error) {
      console.error("Erro ao deletar ONG:", error);
      throw new CustomError("Erro ao deletar ONG", 500);
    }
  }

  async update(ngoId: number, data: Partial<OngProps>): Promise<OngProps> {
    try {
      const existingNgo = await NgoModel.findById(ngoId);

      if (!existingNgo) {
        throw new CustomError('ONG não encontrada', 404);
      }

      const updatedNgo = await NgoModel.findByIdAndUpdate(
        ngoId,
        { $set: data },
        { new: true }
      );
      
      if (!updatedNgo) {
        throw new CustomError('Erro ao atualizar ONG', 500);
      }
      
      // Use the helper method to convert to OngProps
      return this.mapToOngProps(updatedNgo);
    } catch (error) {
      console.error("Erro ao atualizar ONG:", error);
      throw new CustomError("Erro ao atualizar ONG", 500);
    }
  }

  async updateNgoGrafic(ngoId: number, data: Partial<{ totalExpenses: number; expensesByCategory: Record<string, number> }>): Promise<any> {
    try {
        console.log("==== UPDATE NGO GRAPHIC START ====");
        console.log("NGO ID:", ngoId);
        console.log("Dados recebidos para atualização:", data);

        const existingGrafic = await NgoGraphicModel.findOne({ ngoId });
        console.log("Gráfico da ONG encontrado:", existingGrafic);

        if (!existingGrafic) {
            throw new CustomError('Gráfico não encontrado', 404);
        }

        const updatedExpensesByCategory = {
            ...data.expensesByCategory,
        };
        console.log("Despesas atualizadas por categoria:", updatedExpensesByCategory);

        const updatedGrafic = await NgoGraphicModel.findOneAndUpdate(
            { ngoId },
            { 
                $set: {
                    totalExpenses: data.totalExpenses ?? existingGrafic.totalExpenses,
                    expensesByAction: updatedExpensesByCategory,
                } 
            },
            { new: true }
        );

        if (!updatedGrafic) {
            throw new CustomError('Erro ao atualizar gráfico da ONG', 500);
        }

        console.log("Gráfico da ONG atualizado com sucesso:", updatedGrafic);
        return updatedGrafic.toObject();
    } catch (error) {
        console.error("Erro ao atualizar gráfico da ONG:", error);
        throw new CustomError("Erro ao atualizar gráfico da ONG", 500);
    } finally {
        console.log("==== UPDATE NGO GRAPHIC END ====");
    }
  }

  async findGraficByNgoId(ngoId: string): Promise<any> {
    try {
      const numericId = parseInt(ngoId);
      const graphic = await NgoGraphicModel.findOne({ ngoId: numericId });
      
      if (graphic) {
        // Convert to plain object and force proper serialization of Map types
        const result = JSON.parse(JSON.stringify(graphic));
        
        // Ensure expensesByAction data is properly processed for each day record
        if (Array.isArray(result.expensesByAction)) {
          result.expensesByAction.forEach(yearEntry => {
            if (yearEntry.months) {
              yearEntry.months.forEach(monthEntry => {
                if (monthEntry.dailyRecords) {
                  monthEntry.dailyRecords.forEach(dailyRecord => {
                    if (Object.keys(dailyRecord.expensesByAction).length === 0 && 
                        graphic.toObject) {
                      const rawObj = graphic.toObject();
                      try {
                        const originalYear = rawObj.expensesByAction.find(
                          y => y.year === yearEntry.year
                        );
                        if (originalYear) {
                          const originalMonth = originalYear.months.find(
                            m => m.month === monthEntry.month
                          );
                          if (originalMonth) {
                            const originalDay = originalMonth.dailyRecords.find(
                              d => d.day === dailyRecord.day
                            );
                            if (originalDay && originalDay.expensesByAction) {
                              dailyRecord.expensesByAction = originalDay.expensesByAction;
                            }
                          }
                        }
                      } catch (err) {
                        console.error("Error processing nested expense data:", err);
                      }
                    }
                  });
                }
              });
            }
          });
        }
        return result;
      }
      return null;
    } catch (error) {
      console.error("Erro ao obter gráfico da ONG:", error);
      throw new CustomError("Erro ao obter gráfico da ONG", 500);
    }
  }
}

export { OngRepository };