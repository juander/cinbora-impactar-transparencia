// @ts-nocheck

import request from 'supertest';
import Fastify from 'fastify';
import { LogController } from '../LogController';
import { logService } from '@config/dependencysInjection/logDependencyInjection';
import { CustomError } from '@shared/customError';

jest.mock('@config/dependencysInjection/logDependencyInjection', () => ({
  logService: {
    getLastLogByNgoId: jest.fn()
  }
}));

const server = Fastify();
const logController = new LogController(logService);

server.get('/logs/ongs/:ngoId/last', logController.getLastLogByNgoId.bind(logController));

describe('LogController - getLastLogByNgoId', () => {
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

  it('should return the last log for a specific NGO', async () => {
    const mockLog = {
      id: '1',
      ngoId: 1,
      action: 'update',
      description: 'Update ONG details',
      timestamp: new Date().toISOString(),
      userId: '1'
    };

    (logService.getLastLogByNgoId as jest.Mock).mockResolvedValue(mockLog);

    const response = await request(server.server)
      .get('/logs/ongs/1/last');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockLog);
    expect(logService.getLastLogByNgoId).toHaveBeenCalledWith(1);
  }, 10000);

  it('should return an error if fetching the log fails', async () => {
    (logService.getLastLogByNgoId as jest.Mock).mockRejectedValue(new Error('Database connection error'));

    const response = await request(server.server)
      .get('/logs/ongs/1/last');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro ao buscar o último log');
  }, 10000);
});