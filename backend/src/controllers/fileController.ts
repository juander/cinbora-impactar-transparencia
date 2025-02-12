import { Response } from 'express';
import { MulterRequest } from '../utils/customTypes';
import * as fileService from '../services/fileService';

export const createFile = (req: MulterRequest, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ message: 'Arquivo não enviado' });
    return;
  }

  const newFile = fileService.createFile(req.file);

  res.status(201).json({
    message: 'Arquivo criado com sucesso!',
    file: newFile,
  });
};

export const listFiles = (req: MulterRequest, res: Response): void => {
  const files = fileService.listFiles();
  res.status(200).json(files);
};

export const deleteFile = (req: MulterRequest, res: Response): void => {
  const { filename } = req.params;  // Pega o 'filename' da URL

  const deletedFile = fileService.deleteFile(filename);  // Chama o serviço para excluir o arquivo

  if (!deletedFile) {
    res.status(404).json({ message: `Arquivo ${filename} não encontrado.` });  // Caso o arquivo não seja encontrado
    return;
  }

  res.status(200).json({
    message: `Arquivo ${filename} deletado com sucesso!`,  // Resposta de sucesso
    file: deletedFile,
  });
};

