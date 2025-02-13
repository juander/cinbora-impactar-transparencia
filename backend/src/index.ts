import express from 'express';
import { PrismaClient } from '@prisma/client';
import userRoutes from './routes';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Rotas
app.use('/api', userRoutes);

// Conectar ao MongoDB
prisma.$connect()
  .then(() => {
    console.log('Conectado ao MongoDB');
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao conectar ao MongoDB:', error);
  });