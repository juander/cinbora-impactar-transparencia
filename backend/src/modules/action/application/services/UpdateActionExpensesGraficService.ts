import { ActionRepository } from "@modules/action";
import { CustomError } from "@shared/customError";

class UpdateActionExpensesGraficService {
  private actionRepository: ActionRepository;

  constructor(actionRepository: ActionRepository) {
    this.actionRepository = actionRepository;
  }

  async execute(actionId: string, newExpense: Record<string, number>): Promise<any> {
    try {
      // Validar os dados de entrada
      if (!actionId || typeof actionId !== 'string') {
        throw new CustomError("ID da ação inválido", 400);
      }
      
      if (!newExpense || typeof newExpense !== 'object') {
        throw new CustomError("Formato de despesas inválido", 400);
      }
      
      // Verificar se há valores negativos
      const hasNegativeValues = Object.values(newExpense).some(value => value < 0);
      if (hasNegativeValues) {
        throw new CustomError("Valores de despesa não podem ser negativos", 400);
      }

      const updatedGrafic = await this.actionRepository.updateActionExpensesGrafic(actionId, newExpense);
      return updatedGrafic;
    } catch (error) {
      console.error("Erro ao atualizar gráfico de despesas da ação:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao atualizar gráfico de despesas da ação", 500);
    }
  }
}

export { UpdateActionExpensesGraficService };