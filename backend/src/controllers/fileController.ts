import { Request, Response } from 'express';
import * as fileService from '../services/fileService';
import { validateFile } from '../utils/validateFile';

// Rota POST - Criar arquivo
export const createFile = (req: Request, res: Response) => {
  const { name, path, mimetype, size, userId } = req.body;

  // Validação simples
  const validation = validateFile(name, path, mimetype, size, userId);
  if (!validation.isValid) {
    return res.status(400).json({ message: validation.message });
  }

  // Chama o serviço para criar o arquivo
  const newFile = fileService.createFile(name, path, mimetype, size, userId);

  return res.status(201).json({
    message: 'Arquivo criado com sucesso!',
    file: newFile,
  });
};

// Rota GET - Listar arquivos
export const listFiles = (req: Request, res: Response) => {
  const files = fileService.listFiles();
  return res.status(200).json(files);
};

// Rota DELETE - Deletar arquivo por ID
export const deleteFile = (req: Request, res: Response) => {
  const { id } = req.params;

  const deletedFile = fileService.deleteFile(Number(id));
  if (!deletedFile) {
    return res.status(404).json({ message: `Arquivo com ID ${id} não encontrado.` });
  }

  return res.status(200).json({
    message: `Arquivo de ID ${id} deletado com sucesso!`,
    file: deletedFile,
  });
};
