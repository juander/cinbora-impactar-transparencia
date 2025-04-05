// @ts-nocheck

import request from 'supertest';
import Fastify from 'fastify';
import { LogController } from '../LogController';
import { logService } from '@config/dependencysInjection/logDependencyInjection';
import { CustomError } from '@shared/customError';

jest.mock('@config/dependencysInjection/logDependencyInjection', () => ({
  logService: {
    getLogsByNgoId: jest.fn()
  }
}));

const server = Fastify();
const logController = new LogController(logService);

// Middleware para adicionar o mock do user token
server.addHook('preHandler', async (request) => {
  // Mocka o request.user para incluir o ngoId do token
  request.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1, profileUrl: 'exampleurl.com' };
});

server.get('/logs/ongs', logController.getOngLogs.bind(logController));

describe('LogController - getOngLogs', () => {
  beforeAll(async () => {
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return logs for the ONG from user token', async () => {
    const mockLogs = [
      {
        id: '1',
        ngoId: 1,
        action: 'update',
        description: 'Update ONG details',
        timestamp: new Date().toISOString(),
        userId: '1'
      },
      {
        id: '2',
        ngoId: 1,
        action: 'create',
        description: 'Create new action',
        timestamp: new Date().toISOString(),
        userId: '1'
      }
    ];

    (logService.getLogsByNgoId as jest.Mock).mockResolvedValue(mockLogs);

    const response = await request(server.server)
      .get('/logs/ongs');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockLogs);
    expect(logService.getLogsByNgoId).toHaveBeenCalledWith(1);
  }, 10000);

  it('should return an error if fetching the logs fails', async () => {
    (logService.getLogsByNgoId as jest.Mock).mockRejectedValue(new Error('Database connection error'));

    const response = await request(server.server)
      .get('/logs/ongs');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro ao obter logs da ONG');
  }, 10000);
});