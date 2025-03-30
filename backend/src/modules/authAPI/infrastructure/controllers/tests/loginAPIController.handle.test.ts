// @ts-nocheck

import Fastify from 'fastify';
import { LoginAPIController } from '../LoginAPIController';
import { AuthController } from '@modules/authAPI';
import { CustomError } from '@shared/customError';

// Definindo o tipo correto para a função mock do jest
type AuthenticateFunction = (email: string, password: string) => Promise<{
  user: any;
  ngo: any;
  token: string;
  actions: any[];
}>;

// Mock do AuthController com tipagem correta
const mockAuthenticate = jest.fn() as jest.MockedFunction<AuthenticateFunction>;
const mockAuthController = {
  authenticate: mockAuthenticate
} as unknown as AuthController;

const server = Fastify();
const loginAPIController = new LoginAPIController(mockAuthController);

// Adiciona rota de teste
server.post('/login', loginAPIController.handle.bind(loginAPIController));

describe('LoginAPIController - handle', () => {
  beforeAll(async () => {
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

    beforeEach(() => {
    jest.clearAllMocks();
    // Mock do console.error para suprimir logs durante os testes
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restaura o comportamento original
  });

  it('should return successful login response with user, token, ngo and actions', async () => {
    // Mock de dados de retorno
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1, profileUrl: 'exampleurl.com' };
    const mockNgo = { id: 1, name: 'Test NGO', description: 'Test description' };
    const mockActions = [{ id: '1', name: 'Action 1', ngoId: 1 }];
    const mockToken = 'jwt-token';

    // Configura o mock do AuthController para retornar dados de sucesso
    mockAuthenticate.mockResolvedValue({
      user: mockUser,
      ngo: mockNgo,
      token: mockToken,
      actions: mockActions
    });

    // Faz a requisição de teste
    const response = await server.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email: 'test@example.com',
        password: 'password123'
      }
    });

    // Verifica o resultado
    expect(response.statusCode).toBe(200);
    
    const responseBody = JSON.parse(response.body);
    expect(responseBody).toEqual({
      message: 'Login bem-sucedido',
      user: mockUser,
      token: mockToken,
      ngo: mockNgo,
      actions: mockActions
    });

    // Verifica se o método authenticate foi chamado com os parâmetros corretos
    expect(mockAuthenticate).toHaveBeenCalledWith(
      'test@example.com',
      'password123'
    );
  });

  it('should handle custom error from AuthController', async () => {
    // Configura o mock para lançar um CustomError
    mockAuthenticate.mockRejectedValue(
      new CustomError('Credenciais inválidas', 401)
    );

    // Faz a requisição de teste
    const response = await server.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      }
    });

    // Verifica o resultado
    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body)).toEqual({
      error: 'Credenciais inválidas'
    });
  });

  it('should handle generic error from AuthController', async () => {
    // Configura o mock para lançar um erro genérico
    mockAuthenticate.mockRejectedValue(new Error('Database connection error'));

    // Faz a requisição de teste
    const response = await server.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email: 'test@example.com',
        password: 'password123'
      }
    });

    // Verifica o resultado
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      error: 'Database connection error'
    });
  });
});