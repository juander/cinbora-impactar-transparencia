import express from 'express';
import fileRoutes from './routes/fileRoutes'; // Certifique-se de que o caminho está correto

const app = express();

app.use(express.json()); // Middleware para parsear JSON

// Definindo as rotas de arquivo
app.use('/files', fileRoutes); // Definindo o prefixo /files para todas as rotas de arquivo

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
