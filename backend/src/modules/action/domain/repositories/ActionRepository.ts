import { Action as ActionModel } from '../../../../../models/action.model';
import { ActionExpensesGrafic as ActionExpensesGraficModel } from '../../../../../models/action-expenses-grafic.model';
import { NgoGraphic as NgoGraphicModel } from '../../../../../models/ngo-graphic.model';
import { ActionFile as ActionFileModel } from '../../../../../models/action-file.model';
import { Action } from "@modules/action";
import s3StorageInstance from "@shared/s3Cliente";
import { CustomError } from "@shared/customError";

class ActionRepository {
  private s3Storage = s3StorageInstance;

  async findById(id: string): Promise<Action | null> {
    try {
      const action = await ActionModel.findById(id);

      if (!action) return null;

      return new Action(
        {
          name: action.name,
          type: action.type,
          ngoId: action.ngoId,
          spent: action.spent,
          goal: action.goal,
          colected: action.colected,
          aws_url: action.aws_url
        },
        action._id.toString()
      );
    } catch (error) {
      console.error("Erro ao buscar ação por ID:", error);
      throw new CustomError("Erro ao buscar ação por ID", 500);
    }
  }

  async findByNgoId(ngoId: string): Promise<Action[]> {
    try {
      const actions = await ActionModel.find({ ngoId: parseInt(ngoId) });

      return actions.map(action => new Action(
        {
          name: action.name,
          type: action.type,
          ngoId: action.ngoId,
          spent: action.spent,
          goal: action.goal,
          colected: action.colected,
          aws_url: action.aws_url
        },
        action._id.toString()
      ));
    } catch (error) {
      console.error("Erro ao buscar ações por ONG ID:", error);
      throw new CustomError("Erro ao buscar ações por ONG ID", 500);
    }
  }

  async findByNgoIdAndActionId(ngoId: string, actionId: string): Promise<Action | null> {
    try {
      const action = await ActionModel.findOne({ _id: actionId, ngoId: parseInt(ngoId) });

      if (!action) return null;

      return new Action(
        {
          name: action.name,
          type: action.type,
          ngoId: action.ngoId,
          spent: action.spent,
          goal: action.goal,
          colected: action.colected,
          aws_url: action.aws_url
        },
        action._id.toString()
      );
    } catch (error) {
      console.error("Erro ao buscar ação por ONG ID e Ação ID:", error);
      throw new CustomError("Erro ao buscar ação por ONG ID e Ação ID", 500);
    }
  }

  async findAll(): Promise<Action[]> {
    try {
      const actions = await ActionModel.find();

      return actions.map(action => new Action(
        {
          name: action.name,
          type: action.type,
          ngoId: action.ngoId,
          spent: action.spent,
          goal: action.goal,
          colected: action.colected,
          aws_url: action.aws_url
        },
        action._id.toString()
      ));
    } catch (error) {
      console.error("Erro ao buscar todas as ações:", error);
      throw new CustomError("Erro ao buscar todas as ações", 500);
    }
  }

  async create(data: Omit<Action, 'id'> & { categorysExpenses: Record<string, number> }): Promise<Action> {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      const expensesArray = [
        {
          year,
          months: [
            {
              month,
              dailyRecords: [
                {
                  day,
                  categorysExpenses: data.categorysExpenses,
                },
              ],
            },
          ],
        },
      ];

      // Criar a ação
      const newAction = new ActionModel({
        name: data.name,
        type: data.type,
        ngoId: data.ngoId,
        spent: data.spent,
        goal: data.goal,
        colected: data.colected,
        aws_url: data.aws_url,
      });

      const createdAction = await newAction.save();

      // Criar o gráfico de despesas da ação
      const newActionExpensesGrafic = new ActionExpensesGraficModel({
        actionId: createdAction._id,
        ngoId: data.ngoId,
        categorysExpenses: expensesArray,
      });

      await newActionExpensesGrafic.save();

      // Atualizar o gráfico da ONG
      await this.updateNgoGraphicAfterActionCreation(data.ngoId);

      return new Action(
        {
          name: createdAction.name,
          type: createdAction.type,
          ngoId: createdAction.ngoId,
          spent: createdAction.spent,
          goal: createdAction.goal,
          colected: createdAction.colected,
          aws_url: createdAction.aws_url
        },
        createdAction._id.toString()
      );
    } catch (error) {
      console.error("Erro ao criar ação:", error);
      throw new CustomError("Erro ao criar ação", 500);
    }
  }

  async update(id: string, data: Partial<Omit<Action, 'id'>>): Promise<Action> {
    try {
      const updatedAction = await ActionModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true }
      );

      if (!updatedAction) {
        throw new CustomError("Ação não encontrada", 404);
      }

      return new Action(
        {
          name: updatedAction.name,
          type: updatedAction.type,
          ngoId: updatedAction.ngoId,
          spent: updatedAction.spent,
          goal: updatedAction.goal,
          colected: updatedAction.colected,
          aws_url: updatedAction.aws_url
        },
        updatedAction._id.toString()
      );
    } catch (error) {
      console.error("Erro ao atualizar ação:", error);
      throw new CustomError("Erro ao atualizar ação", 500);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const action = await ActionModel.findById(id).populate('files');

      if (!action) {
        throw new CustomError("Ação não encontrada", 404);
      }

      const actionName = action.name;
      const ngoId = action.ngoId;

      // Excluir arquivos da ação no S3
      try {
        await this.s3Storage.deleteFolder(`${ngoId}/actions/${id}`);
        console.log(`Todos os arquivos da ação ${id} foram excluídos com sucesso`);
      } catch (s3Error) {
        console.error(`Erro ao excluir arquivos da ação ${id}:`, s3Error);
      }

      // Excluir registros relacionados
      await ActionFileModel.deleteMany({ actionId: id });
      await ActionExpensesGraficModel.deleteMany({ actionId: id });
      await ActionModel.findByIdAndDelete(id);

      // Atualizar o gráfico da ONG
      await this.updateNgoGraphicAfterActionDeletion(ngoId, actionName);
    } catch (error) {
      console.error("Erro ao deletar ação:", error);
      throw new CustomError("Erro ao deletar ação", 500);
    }
  }

  async findExpensesByActionId(actionId: string): Promise<any> {
    try {
      const expenses = await ActionExpensesGraficModel.findOne({ actionId });
      if (!expenses) {
        throw new CustomError("Gráfico de despesas não encontrado para a ação", 404);
      }
      return expenses.toObject();
    } catch (error) {
      console.error("Erro ao buscar gráfico de despesas por ID da ação:", error);
      throw new CustomError("Erro ao buscar gráfico de despesas por ID da ação", 500);
    }
  }

  async updateActionExpensesGrafic(actionId: string, newExpense: Record<string, number>): Promise<any> {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      const existingExpenses = await ActionExpensesGraficModel.findOne({ actionId });

      if (!existingExpenses) {
        throw new CustomError("Gráfico de despesas não encontrado para a ação", 404);
      }

      // Garantir que o campo categorysExpenses exista e seja um array
      if (!existingExpenses.categorysExpenses || !Array.isArray(existingExpenses.categorysExpenses)) {
        existingExpenses.categorysExpenses = [];
      }

      let expensesArray = existingExpenses.categorysExpenses;
      let yearData = expensesArray.find((entry: any) => entry.year === year);

      if (!yearData) {
        yearData = { year, months: [] };
        expensesArray.push(yearData);
      }

      let monthData = yearData.months.find((m: any) => m.month === month);

      if (!monthData) {
        monthData = { month, dailyRecords: [] };
        yearData.months.push(monthData);
      }

      const dayData = monthData.dailyRecords.find((d: any) => d.day === day);

      if (dayData) {
        // Atualizar as despesas existentes para o dia
        dayData.categorysExpenses = { ...dayData.categorysExpenses, ...newExpense };
      } else {
        // Adicionar um novo registro diário
        monthData.dailyRecords.push({ day, categorysExpenses: newExpense });
      }

      // Atualizar o campo categorysExpenses no documento
      existingExpenses.categorysExpenses = expensesArray;

      // Salvar o documento atualizado no banco de dados
      await existingExpenses.markModified('categorysExpenses');
      await existingExpenses.save();

      return existingExpenses.toObject();
    } catch (error) {
      console.error("Erro ao atualizar gráfico de despesas da ação:", error);
      throw new CustomError("Erro ao atualizar gráfico de despesas da ação", 500);
    }
  }

  private async updateNgoGraphicAfterActionCreation(ngoId: number): Promise<void> {
    try {
      const actions = await ActionModel.find({ ngoId });
      const totalExpenses = actions.reduce((sum, action) => sum + Number(action.spent || 0), 0);

      await NgoGraphicModel.findOneAndUpdate(
        { ngoId },
        { $set: { totalExpenses } },
        { upsert: true }
      );
    } catch (error) {
      console.error("Erro ao atualizar gráfico da ONG após criação da ação:", error);
    }
  }

  private async updateNgoGraphicAfterActionDeletion(ngoId: number, deletedActionName: string): Promise<void> {
    try {
      const ngoGraphic = await NgoGraphicModel.findOne({ ngoId });

      if (!ngoGraphic) return;

      const actions = await ActionModel.find({ ngoId });
      const totalExpenses = actions.reduce((sum, action) => sum + (action.spent || 0), 0);

      await NgoGraphicModel.findOneAndUpdate(
        { ngoId },
        { $set: { totalExpenses } }
      );
    } catch (error) {
      console.error("Erro ao atualizar gráfico da ONG após exclusão da ação:", error);
    }
  }
}

export { ActionRepository };