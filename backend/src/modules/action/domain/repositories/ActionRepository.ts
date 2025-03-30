import prismaClient from "@shared/prismaClient";
import { Action } from "@modules/action";
import s3StorageInstance from "@shared/s3Cliente";
import { CustomError } from "@shared/customError";
import { Prisma } from "@prisma/client";

class ActionRepository {
  private s3Storage = s3StorageInstance;

  async findById(id: string): Promise<Action | null> {
    try {
      const action = await prismaClient.action.findUnique({
        where: { id },
      });

      if (!action) return null;

      return new Action(action, action.id);
    } catch (error) {
      console.error("Erro ao buscar ação por ID:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao buscar ação por ID", 400);
      }
      throw new CustomError("Erro ao buscar ação", 500);
    }
  }

  async findByNgoId(ngoId: string): Promise<Action[]> {
    try {
      const actions = await prismaClient.action.findMany({
        where: { ngoId: parseInt(ngoId) },
      });
      return actions.map(action => new Action(action, action.id));
    } catch (error) {
      console.error("Erro ao buscar ações por ONG ID:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao buscar ações por ONG ID", 400);
      }
      throw new CustomError("Erro ao buscar ações por ONG ID", 500);
    }
  }

  async findByNgoIdAndActionId(ngoId: string, actionId: string): Promise<Action | null> {
    try {
      const action = await prismaClient.action.findUnique({
        where: { id: actionId, ngoId: parseInt(ngoId) },
      });

      if (!action) return null;

      return new Action(action, action.id);
    } catch (error) {
      console.error("Erro ao buscar ação por ONG ID e Ação ID:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao buscar ação por ONG ID e Ação ID", 400);
      }
      throw new CustomError("Erro ao buscar ação por ONG ID e Ação ID", 500);
    }
  }

  async findAll(): Promise<Action[]> {
    try {
      const actions = await prismaClient.action.findMany();
      return actions.map(action => new Action(action, action.id));
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

        // Primeiro criamos a ação
        const createdAction = await prismaClient.action.create({
            data: {
                name: data.name,
                type: data.type,
                ngoId: data.ngoId,
                spent: data.spent,
                goal: data.goal,
                colected: data.colected,
                aws_url: data.aws_url,
            },
        });

        // Em seguida, criamos o gráfico de despesas da ação
        await prismaClient.actionExpensesGrafic.create({
            data: {
                actionId: createdAction.id,
                ngoId: data.ngoId,
                categorysExpenses: expensesArray,
            },
        });

        // Update NGO graphic with the new action data
        try {
            // Get all actions for this NGO including the newly created one
            const allActions = await prismaClient.action.findMany({ 
                where: { ngoId: data.ngoId } 
            });
            
            // Get or create NGO graphic
            const ngoGraphic = await prismaClient.ngoGraphic.findUnique({ 
                where: { ngoId: data.ngoId } 
            });
            
            // Calculate all actions expenses
            const allActionsExpenses = allActions.reduce<Record<string, number>>((acc, action) => {
                acc[action.name] = action.spent || 0;
                return acc;
            }, {});
            
            let ngoExpensesArray = [];
            
            if (ngoGraphic) {
                // Update existing NGO graphic
                ngoExpensesArray = ngoGraphic.expensesByAction as any[];
                let yearData = ngoExpensesArray.find((entry) => entry.year === year);
                
                if (!yearData) {
                    yearData = { year, months: [] };
                    ngoExpensesArray.push(yearData);
                }
                
                let monthData = yearData.months.find((m: { month: number, dailyRecords: any[] }) => m.month === month);
                if (!monthData) {
                    monthData = { month, dailyRecords: [] };
                    yearData.months.push(monthData);
                }
                
                const dayData = monthData?.dailyRecords.find((d: { day: number, expensesByAction: Record<string, number> }) => d.day === day);
                if (dayData) {
                    dayData.expensesByAction = allActionsExpenses;
                } else {
                    monthData.dailyRecords.push({ day, expensesByAction: allActionsExpenses });
                }
            } else {
                // Create new NGO graphic structure
                ngoExpensesArray = [
                    {
                        year,
                        months: [
                            {
                                month,
                                dailyRecords: [
                                    { 
                                        day, 
                                        expensesByAction: allActionsExpenses 
                                    }
                                ]
                            }
                        ]
                    }
                ];
            }
            
            // Calculate total expenses from all actions
            const totalExpenses = allActions.reduce((sum, action) => sum + (action.spent || 0), 0);
            
            // Update or create the NGO graphic
            await prismaClient.ngoGraphic.upsert({
                where: { ngoId: data.ngoId },
                update: {
                    expensesByAction: ngoExpensesArray,
                    totalExpenses,
                },
                create: {
                    ngoId: data.ngoId,
                    expensesByAction: ngoExpensesArray,
                    totalExpenses,
                }
            });
        } catch (ngoGraphicError) {
            console.error("Erro ao atualizar gráfico da ONG durante criação da ação:", ngoGraphicError);
        }

        return new Action(createdAction, createdAction.id);
    } catch (error) {
        console.error("Erro ao criar ação:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            throw new CustomError("Erro ao criar ação", 400);
        }
        throw new CustomError("Erro ao criar ação", 500);
    }
  }

  async update(id: string, data: Partial<Omit<Action, 'id'>>): Promise<Action> {
    try {
      const updatedAction = await prismaClient.action.update({
        where: { id },
        data,
      });

      return new Action(updatedAction, updatedAction.id);
    } catch (error) {
      console.error("Erro ao atualizar ação:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao atualizar ação", 400);
      }
      throw new CustomError("Erro ao atualizar ação", 500);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const action = await prismaClient.action.findUnique({
        where: { id: id },
        include: { files: true }
      });
  
      if (!action) {
        throw new CustomError("Ação não encontrada", 404);
      }
  
      const actionName = action.name;
      const ngoId = action.ngoId;
  
      // Usar a nova abordagem para excluir toda a pasta da ação de uma vez
      try {
        // Exclui tudo em /{ngoId}/actions/{actionId}/
        await this.s3Storage.deleteFolder(`${action.ngoId}/actions/${action.id}`);
        console.log(`Todos os arquivos da ação ${action.id} foram excluídos com sucesso`);
      } catch (s3Error) {
        console.error(`Erro ao excluir arquivos da ação ${action.id}:`, s3Error);
        // Continuar com a deleção dos registros no banco mesmo se falhar no S3
      }
  
      // Excluir os registros relacionados sequencialmente
      await prismaClient.actionFile.deleteMany({ where: { actionId: id } });
      await prismaClient.actionExpensesGrafic.deleteMany({ where: { actionId: id } });
      await prismaClient.action.delete({ where: { id: id } });
  
      // Após excluir a ação, atualize o NGO graphic para remover a ação excluída
      await this.updateNgoGraphicAfterActionDeletion(ngoId, actionName);
  
      return;
    } catch (error) {
      console.error("Erro ao deletar ação:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao deletar ação", 400);
      }
      throw new CustomError("Erro ao deletar ação", 500);
    }
  }
  
  private async updateNgoGraphicAfterActionDeletion(ngoId: number, deletedActionName: string): Promise<void> {
    try {
      // Buscar o gráfico da ONG
      const ngoGraphic = await prismaClient.ngoGraphic.findUnique({
        where: { ngoId },
      });
  
      if (!ngoGraphic) {
        console.log(`NGO graphic não encontrado para ngoId: ${ngoId}`);
        return;
      }
  
      // Buscar todas as ações restantes da ONG
      const remainingActions = await prismaClient.action.findMany({
        where: { ngoId },
      });
  
      // Calcular o total de despesas das ações restantes
      const totalExpenses = remainingActions.reduce((sum, action) => sum + (action.spent || 0), 0);
  
      // Obter o array de expenses do NGO graphic
      const expensesArray = ngoGraphic.expensesByAction as any[];
      let updated = false;
  
      if (expensesArray && expensesArray.length > 0) {
        // Encontrar o último ano no array
        const latestYear = expensesArray[expensesArray.length - 1];
        
        if (latestYear?.months && latestYear.months.length > 0) {
          // Encontrar o último mês no último ano
          const latestMonth = latestYear.months[latestYear.months.length - 1];
          
          if (latestMonth?.dailyRecords && latestMonth.dailyRecords.length > 0) {
            // Encontrar o último dia no último mês
            const latestDailyRecords = latestMonth.dailyRecords;
            
            // Atualizar todos os registros diários recentes (últimos 30 dias, por exemplo) para remover a ação excluída
            for (const dailyRecord of latestDailyRecords) {
              if (dailyRecord.expensesByAction && dailyRecord.expensesByAction[deletedActionName] !== undefined) {
                // Remover a ação excluída do registro
                delete dailyRecord.expensesByAction[deletedActionName];
                updated = true;
              }
            }
          }
        }
      }
  
      if (updated) {
        // Atualizar o NGO graphic com os dados atualizados
        await prismaClient.ngoGraphic.update({
          where: { ngoId },
          data: {
            expensesByAction: expensesArray,
            totalExpenses,
          },
        });
        console.log(`NGO graphic atualizado após exclusão da ação: ${deletedActionName}`);
      }
    } catch (error) {
      console.error("Erro ao atualizar NGO graphic após exclusão da ação:", error);
      // Não lançamos o erro para não afetar o fluxo principal de exclusão da ação
    }
  }

  async updateActionExpensesGrafic(actionId: string, newExpense: Record<string, number>): Promise<any> {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
  
      // Buscar os registros existentes no banco
      const existingExpenses = await prismaClient.actionExpensesGrafic.findFirst({
        where: { actionId },
      });
  
      let expensesArray: any[] = [];
  
      if (existingExpenses) {
        expensesArray = existingExpenses.categorysExpenses as any[];
        let yearData = expensesArray.find((entry) => entry.year === year);
  
        if (!yearData) {
          yearData = { year, months: [] };
          expensesArray.push(yearData);
        }
  
        let monthData = yearData.months.find((m: { month: number, dailyRecords: any[] }) => m.month === month);
  
        if (!monthData) {
          monthData = { month, dailyRecords: [] };
          yearData.months.push(monthData);
        }
  
        const dayData = monthData?.dailyRecords.find((d: { day: number, categorysExpenses: Record<string, number> }) => d.day === day);
  
        if (dayData) {
          // Substitui os dados do dia atual
          dayData.categorysExpenses = newExpense;
        } else {
          monthData.dailyRecords.push({ day, categorysExpenses: newExpense });
        }
  
        await prismaClient.actionExpensesGrafic.update({
          where: { id: existingExpenses.id },
          data: { categorysExpenses: expensesArray },
        });
      } else {
        expensesArray = [{ year, months: [{ month, dailyRecords: [{ day, categorysExpenses: newExpense }] }] }];
  
        await prismaClient.actionExpensesGrafic.create({
          data: {
            actionId,
            ngoId: parseInt(actionId),
            categorysExpenses: expensesArray,
          },
        });
      }
  
      // Pegar a versão mais atual após as modificações
      const updatedActionExpenses = await prismaClient.actionExpensesGrafic.findFirst({ where: { actionId } });
      if (!updatedActionExpenses) throw new CustomError("Erro ao buscar despesas atualizadas", 500);
      
      // Ponto 4: Calcular corretamente o novo spent da ação (último dailyRecord)
      let latestSpent = 0;
      const currentExpensesArray = updatedActionExpenses.categorysExpenses as Array<any>;
      
      if (currentExpensesArray && currentExpensesArray.length > 0) {
        const latestYear = currentExpensesArray[currentExpensesArray.length - 1];
        if (latestYear?.months && latestYear.months.length > 0) {
          const latestMonth = latestYear.months[latestYear.months.length - 1];
          if (latestMonth?.dailyRecords && latestMonth.dailyRecords.length > 0) {
            const latestDay = latestMonth.dailyRecords[latestMonth.dailyRecords.length - 1];
            if (latestDay?.categorysExpenses) {
              latestSpent = Object.values(latestDay.categorysExpenses as Record<string, number>)
                .reduce((sum, amount) => sum + Number(amount), 0);
            }
          }
        }
      }
  
      const updatedAction = await prismaClient.action.update({
        where: { id: actionId },
        data: { spent: latestSpent },
        include: { ngo: true },
      });
  
      if (!updatedAction.ngo) throw new CustomError("Ação sem ONG associada", 404);
      const ngoId = updatedAction.ngo.id;
  
      // Ponto 5: Tratamento de erros Prisma mais robusto
      try {
        // Atualizar dados da ONG
        const [allActions, ngoGraphic] = await Promise.all([
          prismaClient.action.findMany({ where: { ngoId } }),
          prismaClient.ngoGraphic.findUnique({ where: { ngoId } }),
        ]);
  
        if (!ngoGraphic) throw new CustomError("Gráfico da ONG não encontrado", 404);
  
        const allActionsExpenses = allActions.reduce<Record<string, number>>((acc, action) => {
          acc[action.name] = action.spent || 0;
          return acc;
        }, {});
  
        const ngoExpensesArray = ngoGraphic.expensesByAction as any[];
        let yearData = ngoExpensesArray.find((entry) => entry.year === year);
  
        if (!yearData) {
          yearData = { year, months: [] };
          ngoExpensesArray.push(yearData);
        }
  
        let monthData = yearData.months.find((m: { month: number, dailyRecords: any[] }) => m.month === month);
        if (!monthData) {
          monthData = { month, dailyRecords: [] };
          yearData.months.push(monthData);
        }
  
        const dayData = monthData?.dailyRecords.find((d: { day: number, categorysExpenses: Record<string, number> }) => d.day === day);
        if (dayData) {
          dayData.expensesByAction = allActionsExpenses;
        } else {
          monthData.dailyRecords.push({ day, expensesByAction: allActionsExpenses });
        }
  
        const totalExpenses = allActions.reduce((sum, action) => sum + (action.spent || 0), 0);
  
        await prismaClient.ngoGraphic.update({
          where: { ngoId },
          data: {
            expensesByAction: ngoExpensesArray,
            totalExpenses,
          },
        });
      } catch (prismaError) {
        console.error("Erro ao atualizar dados da ONG:", prismaError);
        throw new CustomError("Erro ao atualizar dados da ONG", 500);
      }
  
      return updatedActionExpenses;
    } catch (error) {
      console.error("Erro ao atualizar gráfico de despesas da ação:", error);
      throw new CustomError("Erro ao atualizar gráfico de despesas da ação", 500);
    }
  }

  async findExpensesByActionId(actionId: string): Promise<any> {
    try {
      return prismaClient.actionExpensesGrafic.findMany({
        where: { actionId },
      });
    } catch (error) {
      console.error("Erro ao buscar despesas por ID da ação:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao buscar despesas por ID da ação", 400);
      }
      throw new CustomError("Erro ao buscar despesas por ID da ação", 500);
    }
  }
}

export { ActionRepository };