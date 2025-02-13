import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response) => {
  try {
    console.log('Buscando usuários...'); // Log para depuração
    const users = await prisma.user.findMany();
    console.log('Usuários encontrados:', users); // Log para depuração
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error); // Log detalhado do erro
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { name, email } = req.body;

  try {
    console.log('Criando usuário...'); // Log para depuração
    const user = await prisma.user.create({
      data: { name, email },
    });
    console.log('Usuário criado:', user); // Log para depuração
    res.json(user);
  } catch (error) {
    console.error('Erro ao criar usuário:', error); // Log detalhado do erro
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};