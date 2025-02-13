import express from 'express';
import { getUsers, createUser } from './controller';

const router = express.Router();

// Rota para buscar usuários
router.get('/users', getUsers);

// Rota para criar usuário
router.post('/users', createUser);

export default router;