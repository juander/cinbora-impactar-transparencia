import express from 'express';
import { getUsers, createUser, getOngData } from './controller';

const router = express.Router();

// Rota para buscar usuários
router.get('/users', getUsers);

// Rota para criar usuário
router.post('/users', createUser);

router.post('/getOngData', getOngData);
export default router;