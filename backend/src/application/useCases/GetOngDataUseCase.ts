import axios from "axios";

interface GetOngDataProps {
  email: string;
  password: string;
}

class GetOngDataUseCase {
  async execute({ email, password }: GetOngDataProps) {
    try {
      console.log("Buscando dados externos...");
      const apiLink = process.env.API_LINK;

      if (!apiLink) {
        throw new Error("API_LINK não está definido nas variáveis de ambiente.");
      }

      const response = await axios.post(apiLink, { email, password });

      console.log("Resposta da API:", response.data);

      if (!response.data.user || !response.data.ngo) {
        throw new Error("Resposta inválida da API. Verifique as credenciais.");
      }

      return response.data;
    } catch (error: any) {
      console.error("Erro ao buscar dados da API externa:", error?.response?.data || error.message);

      throw new Error(
        error.response?.data?.message || "Erro ao buscar dados da API externa."
      );
    }
  }
}

export { GetOngDataUseCase };
