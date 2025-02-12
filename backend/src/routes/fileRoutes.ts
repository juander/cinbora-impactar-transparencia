import { Router } from 'express';
import { createFile, listFiles, deleteFile } from '../controllers/fileController';
import multer from 'multer';
import { MulterRequest } from '../utils/customTypes';
import path from 'path';

const uploadDir = path.join(__dirname, '../uploads'); // Caminho absoluto para o diretório de uploads

// Configuração do multer com armazenamento personalizado
const upload = multer({
  dest: uploadDir, // Alinhando o diretório com o uploadDir
});

const router = Router();

// Middleware para ajustar o tipo MulterRequest
const adaptMulterRequest = (
    handler: (req: MulterRequest, res: any) => void
  ): ((req: any, res: any) => void) => {
    return (req, res) => {
      handler(req as MulterRequest, res);
    };
  };

// Rotas para manipulação de arquivos
router.post('/', upload.single('file'), adaptMulterRequest(createFile));
router.get('/', adaptMulterRequest(listFiles));
router.delete('/:filename', adaptMulterRequest(deleteFile));

export default router;
