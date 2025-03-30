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
      if (error.name === 'CastError') {
        throw new CustomError("Erro ao buscar ação por ID", 400);
      }
      throw new CustomError("Erro ao buscar ação", 500);
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
      if (error.name === 'CastError') {
        throw new CustomError("Erro ao buscar ações por ONG ID", 400);
      }
      throw new CustomError("Erro ao buscar ações por ONG ID", 500);
    }
  }

  async findByNgoIdAndActionId(ngoId: string, actionId: string): Promise<Action | null> {
    try {
      const action = await ActionModel.findOne({ 
        _id: actionId, 
        ngoId: parseInt(ngoId) 
      });

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
      if (error.name === 'CastError') {
        throw new CustomError("Erro ao buscar ação por ONG ID e Ação ID", 400);
      }
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

  async create(data: Omit<Action, 'id'> & { categorysExpenses?: Record<string, number> }): Promise<Action> {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      const categorysExpenses = data.categorysExpenses || {};

      const expensesArray = [
        {
          year,
          months: [
            {
              month,
              dailyRecords: [
                {
                  day,
                  categorysExpenses: { ...categorysExpenses },
                },
              ],
            },
          ],
        },
      ];

      const newAction = new ActionModel({
        name: data.name,
        type: data.type,
        ngoId: data.ngoId,
        spent: data.spent || 0,
        goal: data.goal,
        colected: data.colected,
        aws_url: data.aws_url,
      });
      
      const createdAction = await newAction.save();

      const actionExpensesGrafic = await ActionExpensesGraficModel.create({
        actionId: createdAction._id.toString(),
        ngoId: data.ngoId,
        categorysExpenses: expensesArray,
      });

      const allActions = await ActionModel.find({ ngoId: data.ngoId });

      const allActionsExpenses = {};
      allActions.forEach(action => {
        allActionsExpenses[action.name] = action.spent || 0;
      });

      const totalExpenses = allActions.reduce((sum, action) => sum + (action.spent || 0), 0);

      const ngoGraphic = await NgoGraphicModel.findOne({ ngoId: data.ngoId });
      
      if (ngoGraphic) {
          const yearExists = ngoGraphic.expensesByAction.some(entry => entry.year === year);
          
          if (!yearExists) {
              await NgoGraphicModel.updateOne(
                  { ngoId: data.ngoId },
                  {
                      $push: {
                          expensesByAction: {
                              year,
                              months: [{
                                  month,
                                  dailyRecords: [{
                                      day,
                                      expensesByAction: allActionsExpenses
                                  }]
                              }]
                          }
                      },
                      $set: { totalExpenses }
                  }
              );
          } else {
              const yearIndex = ngoGraphic.expensesByAction.findIndex(entry => entry.year === year);
              const yearEntry = ngoGraphic.expensesByAction[yearIndex];
              
              const monthExists = yearEntry.months.some(m => m.month === month);
              
              if (!monthExists) {
                  await NgoGraphicModel.updateOne(
                      { ngoId: data.ngoId },
                      {
                          $push: {
                              [`expensesByAction.${yearIndex}.months`]: {
                                  month,
                                  dailyRecords: [{
                                      day,
                                      expensesByAction: allActionsExpenses
                                  }]
                              }
                          },
                          $set: { totalExpenses }
                      }
                  );
              } else {
                  const monthIndex = yearEntry.months.findIndex(m => m.month === month);
                  const monthEntry = yearEntry.months[monthIndex];
                  
                  const dayExists = monthEntry.dailyRecords.some(d => d.day === day);
                  
                  if (!dayExists) {
                      await NgoGraphicModel.updateOne(
                          { ngoId: data.ngoId },
                          {
                              $push: {
                                  [`expensesByAction.${yearIndex}.months.${monthIndex}.dailyRecords`]: {
                                      day,
                                      expensesByAction: allActionsExpenses
                                  }
                              },
                              $set: { totalExpenses }
                          }
                      );
                  } else {
                      const dayIndex = monthEntry.dailyRecords.findIndex(d => d.day === day);
                      await NgoGraphicModel.updateOne(
                          { ngoId: data.ngoId },
                          {
                              $set: {
                                  [`expensesByAction.${yearIndex}.months.${monthIndex}.dailyRecords.${dayIndex}.expensesByAction`]: allActionsExpenses,
                                  totalExpenses
                              }
                          }
                      );
                  }
              }
          }
      } else {
          const ngoGraphicData = {
              ngoId: data.ngoId,
              totalExpenses,
              expensesByAction: [{
                  year,
                  months: [{
                      month,
                      dailyRecords: [{
                          day,
                          expensesByAction: allActionsExpenses
                      }]
                  }]
              }]
          };
          
          await NgoGraphicModel.create(ngoGraphicData);
      }

      return new Action(
        {
          name: createdAction.name,
          type: createdAction.type,
          ngoId: createdAction.ngoId,
          spent: createdAction.spent,
          goal: createdAction.goal,
          colected: createdAction.colected,
          aws_url: createdAction.aws_url,
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
      if (error.name === 'CastError') {
        throw new CustomError("Erro ao atualizar ação", 400);
      }
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

      try {
        await this.s3Storage.deleteFolder(`${ngoId}/actions/${id}`);
      } catch (s3Error) {
        console.error(`Erro ao excluir arquivos da ação ${id}:`, s3Error);
      }

      await ActionFileModel.deleteMany({ actionId: id });
      await ActionExpensesGraficModel.deleteMany({ actionId: id });
      await ActionModel.findByIdAndDelete(id);

      await this.updateNgoGraphicAfterActionDeletion(ngoId, actionName);
    } catch (error) {
      console.error("Erro ao deletar ação:", error);
      if (error.name === 'CastError') {
        throw new CustomError("Erro ao deletar ação", 400);
      }
      throw new CustomError("Erro ao deletar ação", 500);
    }
  }

  private async updateNgoGraphicAfterActionDeletion(ngoId: number, deletedActionName: string): Promise<void> {
    try {
      // Get the remaining actions after deletion
      const remainingActions = await ActionModel.find({ ngoId });
      
      // Create an object with only the remaining actions' expenses
      const currentActionExpenses = {};
      remainingActions.forEach(action => {
        currentActionExpenses[action.name] = action.spent || 0;
      });
      
      // Recalculate the total expenses based only on remaining actions
      const totalExpenses = remainingActions.reduce((sum, action) => sum + (action.spent || 0), 0);
      
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
  
      // Use a direct MongoDB update operation with aggregation to:
      // 1. Remove the deleted action from all expensesByAction records
      // 2. Update today's record with the correct remaining actions
      const ngoGraphic = await NgoGraphicModel.findOne({ ngoId });
      if (!ngoGraphic) return;
      
      // Deep clone the expensesByAction array to avoid reference issues
      const expensesArray = JSON.parse(JSON.stringify(ngoGraphic.expensesByAction || []));
      
      // Remove deleted action from all records
      let hasUpdatedToday = false;
      
      for (let i = 0; i < expensesArray.length; i++) {
        const yearEntry = expensesArray[i];
        if (yearEntry.year === year) {
          for (let j = 0; j < yearEntry.months.length; j++) {
            const monthEntry = yearEntry.months[j];
            if (monthEntry.month === month) {
              for (let k = 0; k < monthEntry.dailyRecords.length; k++) {
                const dailyRecord = monthEntry.dailyRecords[k];
                if (dailyRecord.day === day) {
                  // Found today's record - update it with only remaining actions
                  dailyRecord.expensesByAction = { ...currentActionExpenses };
                  hasUpdatedToday = true;
                } else if (dailyRecord.expensesByAction && 
                           dailyRecord.expensesByAction[deletedActionName] !== undefined) {
                  // For other days, just remove the deleted action
                  delete dailyRecord.expensesByAction[deletedActionName];
                }
              }
            }
          }
        }
      }
      
      // If today's record doesn't exist yet, create it
      if (!hasUpdatedToday) {
        // Find or create year entry
        let yearEntry = expensesArray.find(entry => entry.year === year);
        if (!yearEntry) {
          yearEntry = { year, months: [] };
          expensesArray.push(yearEntry);
        }
        
        // Find or create month entry
        let monthEntry = yearEntry.months.find(m => m.month === month);
        if (!monthEntry) {
          monthEntry = { month, dailyRecords: [] };
          yearEntry.months.push(monthEntry);
        }
        
        // Add today's record with only remaining actions
        monthEntry.dailyRecords.push({
          day,
          expensesByAction: { ...currentActionExpenses }
        });
      }
      
      // Update the entire document with atomic operation
      await NgoGraphicModel.updateOne(
        { ngoId },
        { 
          $set: {
            expensesByAction: expensesArray,
            totalExpenses
          }
        }
      );
      
    } catch (error) {
      console.error("Erro ao atualizar gráfico da ONG após exclusão da ação:", error);
    }
  }

  async updateActionExpensesGrafic(actionId: string, newExpense: Record<string, number>): Promise<any> {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      const action = await ActionModel.findById(actionId);
      if (!action) {
        throw new CustomError("Ação não encontrada", 404);
      }

      const newTotalSpent = Object.values(newExpense).reduce((sum, value) => sum + value, 0);
      
      await ActionModel.findByIdAndUpdate(actionId, { spent: newTotalSpent });

      const existingExpenses = await ActionExpensesGraficModel.findOne({ actionId });
      let expensesArray = [];

      if (existingExpenses) {
        expensesArray = existingExpenses.categorysExpenses || [];
        
        let yearData = expensesArray.find((entry) => entry.year === year);
        if (!yearData) {
          yearData = { year, months: [] };
          expensesArray.push(yearData);
        }

        let monthData = yearData.months.find((m) => m.month === month);
        if (!monthData) {
          monthData = { month, dailyRecords: [] };
          yearData.months.push(monthData);
        }

        const dayData = monthData.dailyRecords.find((d) => d.day === day);
        if (dayData) {
          dayData.categorysExpenses = newExpense;
        } else {
          monthData.dailyRecords.push({ day, categorysExpenses: newExpense });
        }

        await ActionExpensesGraficModel.updateOne(
          { actionId },
          { $set: { categorysExpenses: expensesArray } }
        );
      } else {
        expensesArray = [
          { 
            year, 
            months: [
              { 
                month, 
                dailyRecords: [
                  { day, categorysExpenses: newExpense }
                ]
              }
            ]
          }
        ];

        await ActionExpensesGraficModel.create({
          actionId,
          ngoId: action.ngoId,
          categorysExpenses: expensesArray,
        });
      }

      const allActions = await ActionModel.find({ ngoId: action.ngoId });
      
      const allActionsExpenses = {};
      allActions.forEach(action => {
        allActionsExpenses[action.name] = action.spent || 0;
      });
      
      const totalExpenses = allActions.reduce((sum, action) => sum + (action.spent || 0), 0);
      
      const ngoGraphic = await NgoGraphicModel.findOne({ ngoId: action.ngoId });
      
      if (ngoGraphic) {
          const yearExists = ngoGraphic.expensesByAction.some(entry => entry.year === year);
          
          if (!yearExists) {
              await NgoGraphicModel.updateOne(
                  { ngoId: action.ngoId },
                  {
                      $push: {
                          expensesByAction: {
                              year,
                              months: [{
                                  month,
                                  dailyRecords: [{
                                      day,
                                      expensesByAction: allActionsExpenses
                                  }]
                              }]
                          }
                      },
                      $set: { totalExpenses }
                  }
              );
          } else {
              const yearIndex = ngoGraphic.expensesByAction.findIndex(entry => entry.year === year);
              const yearEntry = ngoGraphic.expensesByAction[yearIndex];
              
              const monthExists = yearEntry.months.some(m => m.month === month);
              
              if (!monthExists) {
                  await NgoGraphicModel.updateOne(
                      { ngoId: action.ngoId },
                      {
                          $push: {
                              [`expensesByAction.${yearIndex}.months`]: {
                                  month,
                                  dailyRecords: [{
                                      day,
                                      expensesByAction: allActionsExpenses
                                  }]
                              }
                          },
                          $set: { totalExpenses }
                      }
                  );
              } else {
                  const monthIndex = yearEntry.months.findIndex(m => m.month === month);
                  const monthEntry = yearEntry.months[monthIndex];
                  
                  const dayExists = monthEntry.dailyRecords.some(d => d.day === day);
                  
                  if (!dayExists) {
                      await NgoGraphicModel.updateOne(
                          { ngoId: action.ngoId },
                          {
                              $push: {
                                  [`expensesByAction.${yearIndex}.months.${monthIndex}.dailyRecords`]: {
                                      day,
                                      expensesByAction: allActionsExpenses
                                  }
                              },
                              $set: { totalExpenses }
                          }
                      );
                  } else {
                      const dayIndex = monthEntry.dailyRecords.findIndex(d => d.day === day);
                      await NgoGraphicModel.updateOne(
                          { ngoId: action.ngoId },
                          {
                              $set: {
                                  [`expensesByAction.${yearIndex}.months.${monthIndex}.dailyRecords.${dayIndex}.expensesByAction`]: allActionsExpenses,
                                  totalExpenses
                              }
                          }
                      );
                  }
              }
          }
      } else {
          const ngoGraphicData = {
              ngoId: action.ngoId,
              totalExpenses,
              expensesByAction: [{
                  year,
                  months: [{
                      month,
                      dailyRecords: [{
                          day,
                          expensesByAction: allActionsExpenses
                      }]
                  }]
              }]
          };
          
          await NgoGraphicModel.create(ngoGraphicData);
      }

      const updatedActionExpenses = await ActionExpensesGraficModel.findOne({ actionId });
      if (!updatedActionExpenses) throw new CustomError("Erro ao buscar despesas atualizadas", 500);

      return updatedActionExpenses;
    } catch (error) {
      console.error("Erro ao atualizar gráfico de despesas da ação:", error);
      throw new CustomError("Erro ao atualizar gráfico de despesas da ação", 500);
    }
  }

  async findExpensesByActionId(actionId: string): Promise<any> {
    try {
      const expenses = await ActionExpensesGraficModel.find({ actionId });
      
      if (!expenses || expenses.length === 0) {
        throw new CustomError("Gráfico de despesas não encontrado para a ação", 404);
      }
      
      return expenses;
    } catch (error) {
      console.error("Erro ao buscar gráfico de despesas por ID da ação:", error);
      if (error.name === 'CastError') {
        throw new CustomError("Erro ao buscar gráfico de despesas por ID da ação", 400);
      }
      throw new CustomError("Erro ao buscar gráfico de despesas por ID da ação", 500);
    }
  }
}

export { ActionRepository };