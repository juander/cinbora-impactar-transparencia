export const validateFile = (file: Express.Multer.File) => {
  const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!validTypes.includes(file.mimetype)) {
    return { isValid: false, message: 'Tipo de arquivo não permitido' };
  }

  if (file.size > 5 * 1024 * 1024) { // Limite de 5MB
    return { isValid: false, message: 'Arquivo maior que o tamanho permitido' };
  }

  return { isValid: true, message: '' };
};
