import axios from "axios";

interface GetOngDataProps {
  email: string;
  password: string;
}

class GetOngDataService {
  async execute({ email, password }: GetOngDataProps) {
    try {
      console.log('Buscando dados externos...'); // Log para depuração
      const apiLink = process.env.API_LINK;
      if (!apiLink) {
        throw new Error('API_LINK is not defined in environment variables');
      }
      const response = await axios.post(apiLink, {
        email,
        password
      });
      console.log('Dados externos encontrados:', response.data); // Log para depuração
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados externos:', error); // Log detalhado do erro
      throw new Error('Erro ao buscar dados externos');
    }
  }
}

export { GetOngDataService };