import { ActionRepository } from "@modules/action";
import { CustomError } from "@shared/customError";

class UpdateActionExpensesGraficService {
  private actionRepository: ActionRepository;

  constructor(actionRepository: ActionRepository) {
    this.actionRepository = actionRepository;
  }

  async execute(actionId: string, newExpense: Record<string, number>): Promise<any> {
    try {
      return await this.actionRepository.updateActionExpensesGrafic(actionId, newExpense);
    } catch (error) {
      console.error("Erro ao atualizar gráfico de despesas da ação:", error);
      throw new CustomError("Erro ao atualizar gráfico de despesas da ação", 500);
    }
  }
}

export { UpdateActionExpensesGraficService };