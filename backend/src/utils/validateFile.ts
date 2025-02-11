export const validateFile = (name: string, path: string, mimetype: string, size: number, userId: number) => {
    if (!name || !path || !mimetype || !size || !userId) {
      return { isValid: false, message: 'Todos os campos são obrigatórios.' };
    }
    if (size <= 0) {
      return { isValid: false, message: 'O tamanho do arquivo deve ser maior que 0.' };
    }
    // Adicionar outras validações de mimetype ou outras regras que forem necessárias
    return { isValid: true, message: '' };
  };
  