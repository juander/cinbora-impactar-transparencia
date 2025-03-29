// Configuração para endpoints da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3015';

export const API = {
  login: `${API_BASE_URL}/login`,
  users: `${API_BASE_URL}/users`,
  user: `${API_BASE_URL}/user`,
  ongs: `${API_BASE_URL}/ongs`,
  actions: (ngoId: string | number) => `${API_BASE_URL}/ongs/${ngoId}/actions`,
  action: (actionId: string | number) => `${API_BASE_URL}/ongs/actions/${actionId}`,
  logs: `${API_BASE_URL}/logs`,
  lastLog: (ngoId: string | number) => `${API_BASE_URL}/logs/last/${ngoId}`,
};
