import { Request } from 'express';

export interface MulterRequest extends Request {
  file?: Express.Multer.File; // Define um único arquivo
  files?: Express.Multer.File[]; // Define múltiplos arquivos (opcional)
}
