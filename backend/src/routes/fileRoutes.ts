import { Router } from 'express';
import * as fileController from '../controllers/fileController';

const router = Router();

// Definindo as rotas e passando os controladores corretamente
router.post('/', fileController.createFile); // Usando o controlador para POST
router.get('/', fileController.listFiles); // Usando o controlador para GET
router.delete('/:id', fileController.deleteFile); // Usando o controlador para DELETE

export default router;
