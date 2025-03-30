import { FastifyRequest } from "fastify";
import { CreateActionService, DeleteActionService, GetActionService, UpdateActionService, UpdateActionExpensesGraficService, ActionProps } from "@modules/action";
import { CreateFileAwsService } from "@modules/file";
import { logService } from "@config/dependencysInjection/logDependencyInjection";
import { MultipartFile } from "@fastify/multipart";
import { CustomError } from "@shared/customError";

interface CustomMultipartFile extends MultipartFile {
  size: number;
}

class ActionController {
  private getActionService: GetActionService;
  private createActionService: CreateActionService;
  private updateActionService: UpdateActionService;
  private deleteActionService: DeleteActionService;
  private updateActionExpensesGraficService: UpdateActionExpensesGraficService;
  private createFileAwsService: CreateFileAwsService;

  constructor(
    getActionService: GetActionService,
    createActionService: CreateActionService,
    updateActionService: UpdateActionService,
    deleteActionService: DeleteActionService,
    updateActionExpensesGraficService: UpdateActionExpensesGraficService,
    createFileAwsService: CreateFileAwsService 
  ) {
    this.getActionService = getActionService;
    this.createActionService = createActionService;
    this.updateActionService = updateActionService;
    this.deleteActionService = deleteActionService;
    this.updateActionExpensesGraficService = updateActionExpensesGraficService;
    this.createFileAwsService = createFileAwsService;
  }
  async getAll(request: FastifyRequest) {
    console.log("==== GET ALL ACTIONS CONTROLLER DEBUGGING ====");
    const { id: ngoId } = request.params as { id: string };
    try {
      return await this.getActionService.executeByNgoId(ngoId);
    } catch (error) {
      console.error("Erro ao obter Ações:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao obter Ações", 500);
    }
  }

  async getOne(request: FastifyRequest) {
    console.log("==== GET ONE ACTION CONTROLLER DEBUGGING ====");
    const { id: actionId } = request.params as { id: string, actionId: string };
    try {
      const action = await this.getActionService.executeById(actionId);
      if (!action) {
        throw new CustomError("Ação não encontrada", 404);
      }
      return action;
    } catch (error) {
      console.error("Erro ao obter Ação:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao obter Ação", 500);
    }
  }

  async getOneWithExpenses(request: FastifyRequest) {
    console.log("==== GET ONE ACTION WITH EXPENSES CONTROLLER DEBUGGING ====");
    const { actionId } = request.params as { actionId: string };
    try {
      const action = await this.getActionService.executeById(actionId);
      if (!action) {
        throw new CustomError("Ação não encontrada", 404);
      }
      const actionGrafic = await this.getActionService.getExpensesByActionId(actionId);
      return { action, actionGrafic };
    } catch (error) {
      console.error("Erro ao obter Ação:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao obter Ação", 500);
    }
  }

  async updateActionExpensesGrafic(request: FastifyRequest) {
    console.log("==== UPDATE ACTION EXPENSES GRAFIC CONTROLLER DEBUGGING ====");
    const { actionId } = request.params as { actionId: string };
    const { categorysExpenses } = request.body as {
      categorysExpenses?: Record<string, number>;
    };

    if (!categorysExpenses) {
      throw new CustomError("Dados de despesas não fornecidos", 400);
    }

    if (!request.user) {
      throw new CustomError("Usuário não autenticado", 401);
    }
    
    try {

      const actionToUpdate = await this.getActionService.executeById(actionId);

      if (!actionToUpdate) {
        throw new CustomError("Ação não encontrada", 404);
      }

      const updatedGrafic = await this.updateActionExpensesGraficService.execute(actionId, categorysExpenses);
      await logService.logAction(request.user.ngoId, request.user.id.toString(), request.user.name, "ATUALIZAR", "Gráfico de Despesas da Ação", actionId, categorysExpenses, `Gráfico de despesas da ação "${actionToUpdate.name}" atualizado`);
      return updatedGrafic;
    } catch (error) {
      console.error("Erro ao atualizar gráfico de despesas da ação:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao atualizar gráfico de despesas da ação", 500);
    }
  }

  async getActionExpensesGrafic(request: FastifyRequest) {
    console.log("==== GET ACTION EXPENSES GRAFIC CONTROLLER DEBUGGING ====");
    const { actionId } = request.params as { id: string, actionId: string };
    try {
      return await this.getActionService.getExpensesByActionId(actionId);
    } catch (error) {
      console.error("Erro ao obter gráfico de despesas da ação:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao obter gráfico de despesas da ação", 500);
    }
  }

  async create(request: FastifyRequest) {
    console.log("==== CREATE ACTION CONTROLLER DEBUGGING ====");
    const parts = request.parts();
    let name = '';
    let type = '';
    let spent = 0;
    let goal = 0;
    let colected = 0;
    let fileBuffer: Buffer | null = null;
    let filename = '';
    let mimetype = '';
    let size = 0;
    const categorysExpenses: Record<string, number> = {};

    for await (const part of parts) {
      if (part.type === 'file') {
        const filePart = part as CustomMultipartFile;
        fileBuffer = await filePart.toBuffer();
        filename = filePart.filename;
        mimetype = filePart.mimetype;
        size = filePart.file.bytesRead;
        console.log("Arquivo recebido:", { filename, mimetype, size });
      } else if (part.type === 'field') {
        const fieldPart = part as { fieldname: string, value: string };
        console.log("Campo recebido:", fieldPart);

        if (fieldPart.fieldname === 'name') name = fieldPart.value;
        if (fieldPart.fieldname === 'type') type = fieldPart.value;
        if (fieldPart.fieldname === 'spent') spent = parseFloat(fieldPart.value);
        if (fieldPart.fieldname === 'goal') goal = parseFloat(fieldPart.value);
        if (fieldPart.fieldname === 'colected') colected = parseFloat(fieldPart.value);
        
        // Handle categorysExpenses fields
        const categoryMatch = fieldPart.fieldname.match(/^categorysExpenses\[(.*?)\]$/);
        if (categoryMatch && categoryMatch[1]) {
          const category = decodeURIComponent(categoryMatch[1].replace(/\+/g, " "));
          categorysExpenses[category] = parseFloat(fieldPart.value);
        }
      }
    }

    console.log("Dados processados para criação:", {
      name,
      type,
      spent,
      goal,
      colected,
      categorysExpenses,
      fileBuffer: fileBuffer ? "Arquivo recebido" : "Nenhum arquivo",
    });

    if (!fileBuffer) {
      throw new CustomError("No file uploaded", 400);
    }

    if (!request.user) {
      throw new CustomError("Usuário não autenticado", 401);
    }

    try {
      // 1. Primeiro criar a ação com aws_url temporária ou vazia
      const action = await this.createActionService.execute({
        name,
        type,
        ngoId: request.user.ngoId,
        spent,
        goal,
        colected,
        aws_url: "",  // URL vazia inicialmente
        categorysExpenses,
      });

      // 2. Agora fazer upload da imagem com o ID da ação
      const aws_url = await this.createFileAwsService.uploadActionImage(
        fileBuffer,
        filename,
        request.user.ngoId,
        action.id.toString()
      );

      // 3. Atualizar a ação com a URL da imagem
      const updatedAction = await this.updateActionService.execute(action.id, { aws_url });

      await logService.logAction(request.user.ngoId, request.user.id.toString(), request.user.name, "CRIAR", "Ação", action.id.toString(), { name, type, spent, goal, colected, aws_url, categorysExpenses }, `Ação "${action.name}" criada`);
      console.log("Ação criada com sucesso:", JSON.stringify(updatedAction, null, 2));
      return updatedAction;
    } catch (error) {
      console.error("Error creating action:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao criar ação", 500);
    }
  }

  async update(request: FastifyRequest) {
    console.log("==== UPDATE ACTION CONTROLLER DEBUGGING ====");
    const { id } = request.params as { id: string };
    const data = request.body as Partial<ActionProps>;

    if (!request.user) {
      throw new CustomError("Usuário não autenticado", 401);
    }
    
    try {
      const actionToUpdate = await this.getActionService.executeById(id);

      if (!actionToUpdate) {
        throw new CustomError("Ação não encontrada", 404);
      }

      const updatedAction = await this.updateActionService.execute(id, data);
      
      await logService.logAction(request.user.ngoId, request.user.id.toString(), request.user.name, "ATUALIZAR", "Ação", id, data, `Ação "${actionToUpdate.name}" atualizada`);
      console.log("Ação atualizada com sucesso:", JSON.stringify(updatedAction, null, 2));
      return updatedAction;
    } catch (error) {
      console.error("Error updating action:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao atualizar ação", 500);
    }
  }

  async updateActionImage(request: FastifyRequest) {
    console.log("==== UPDATE ACTION IMAGE CONTROLLER DEBUGGING ====");
    const { id } = request.params as { id: string };
    const parts = request.parts();
    let fileBuffer: Buffer | null = null;
    let filename = '';

    for await (const part of parts) {
      if (part.type === 'file') {
        const filePart = part as CustomMultipartFile;
        fileBuffer = await filePart.toBuffer();
        filename = filePart.filename;
        console.log("Arquivo recebido para atualização de imagem:", { filename });
      }
    }

    if (!fileBuffer) {
      throw new CustomError("No file uploaded", 400);
    }

    if (!request.user) {
      throw new CustomError("Usuário não autenticado", 401);
    }
    
    try {
      const action = await this.getActionService.executeById(id);
      if (!action) {
        throw new CustomError("Ação não encontrada", 404);
      }

      // Se existe uma imagem anterior, exclua-a
      if (action.aws_url) {
        try {
          await this.createFileAwsService.deleteFile(action.aws_url);
        } catch (deleteError) {
          console.error("Erro ao excluir imagem anterior:", deleteError);
          // Continua mesmo se falhar ao excluir
        }
      }

      const aws_url = await this.createFileAwsService.uploadActionImage(
        fileBuffer,
        filename,
        request.user.ngoId,  // ID da ONG do usuário autenticado
        id                   // ID da ação que está sendo atualizada
      );

      const actionToUpdate = await this.getActionService.executeById(id);

      if (!actionToUpdate) {
        throw new CustomError("Ação não encontrada", 404);
      }
  
      const updatedAction = await this.updateActionService.execute(id, { aws_url });
      
      await logService.logAction(request.user.ngoId, request.user.id.toString(), request.user.name, "ATUALIZAR", "Ação", id, { actionName: actionToUpdate.name}, `Imagem de capa da ação "${actionToUpdate.name}" atualizada`);

      console.log("Imagem da ação atualizada com sucesso:", { aws_url: updatedAction.aws_url });
      return { message: "Imagem da ação atualizada com sucesso", aws_url: updatedAction.aws_url };
    } catch (error) {
      console.error("Error updating action image:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao atualizar imagem da ação", 500);
    }
  }

  async delete(request: FastifyRequest) {
    console.log("==== DELETE ACTION CONTROLLER DEBUGGING ====");
    if (!request.user) {
      throw new CustomError("Usuário não autenticado", 401);
    }

    const { id } = request.params as { id: string };

    try {
      const actionToDelete = await this.getActionService.executeById(id);

      if (!actionToDelete) {
        throw new CustomError("Ação não encontrada", 404);
      }
      
      await logService.logAction(
        request.user.ngoId, 
        request.user.id.toString(), 
        request.user.name, 
        "DELETAR", 
        "Ação", 
        id, 
        {
          deletedAction: {
            name: actionToDelete.name,
            type: actionToDelete.type,
          }
        }, 
        `Ação "${actionToDelete.name}" deletada`
      );
      await this.deleteActionService.execute({ id });
      console.log("Ação deletada com sucesso:", { id });
      return { message: "Ação deletada com sucesso" };
    } catch (error) {
      console.error("Error deleting action:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao deletar ação", 500);
    }
  }
}

export { ActionController };