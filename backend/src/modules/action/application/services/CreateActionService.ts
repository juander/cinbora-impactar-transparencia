import { Action, ActionProps, ActionRepository } from "@modules/action";
import { CustomError } from "@shared/customError";

// Extended interface to include categorysExpenses
interface ActionCreateProps extends ActionProps {
  categorysExpenses?: Record<string, number>;
  imageBuffer?: Buffer;
  imageName?: string;
}

class CreateActionService {
  private actionRepository: ActionRepository;
  private s3Storage: any; // Assuming s3Storage is injected or initialized elsewhere

  constructor(actionRepository: ActionRepository, s3Storage: any) {
    this.actionRepository = actionRepository;
    this.s3Storage = s3Storage;
  }

  async execute(data: ActionCreateProps): Promise<Action> {
    try {
      console.log("==== CREATE ACTION SERVICE DEBUGGING ====");
      console.log("Dados recebidos para criação:", JSON.stringify(data, null, 2));

      // Create a base Action without categorysExpenses and aws_url
      const actionData = { ...data, aws_url: '', categorysExpenses: data.categorysExpenses || {} };
      console.log("Dados formatados para criação:", JSON.stringify(actionData, null, 2));

      const action = await this.actionRepository.create(actionData);
      console.log("Ação criada com sucesso:", JSON.stringify(action, null, 2));
      
      // If there is an image, upload it using the ID of the newly created action
      if (data.imageBuffer) {
        console.log("Iniciando upload da imagem...");
        const path = this.s3Storage.buildPath(action.ngoId, 'actions', action.id);
        const aws_url = await this.s3Storage.saveFile(
          data.imageBuffer, 
          data.imageName, 
          path
        );
        console.log("Imagem salva no S3 com URL:", aws_url);
        
        // Update the action with the image URL
        await this.actionRepository.update(action.id, { aws_url });
        action.aws_url = aws_url;
        console.log("Ação atualizada com URL da imagem:", JSON.stringify(action, null, 2));
      }
      
      return action;
    } catch (error) {
      console.error("Erro ao criar ação:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao criar ação", 500);
    }
  }
}

export { CreateActionService, ActionCreateProps };