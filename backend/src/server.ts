import express from 'express';
import fileRoutes from './routes/fileRoutes';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do middleware para parsear o corpo da requisição
app.use(express.json());

const uploadDir = path.join(__dirname, '../uploads');  // Agora está fora de 'src'

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Verifica se o diretório existe, caso contrário, cria
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });  // Cria o diretório 'uploads' na raiz, se necessário
    }
    cb(null, uploadDir);  // Define o diretório de destino
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);  // Define o nome único para o arquivo
  }
});

const upload = multer({ storage });

// Rotas para manipulação de arquivos
app.use('/files', fileRoutes);

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
