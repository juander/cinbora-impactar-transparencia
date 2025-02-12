import fs from 'fs';
import path from 'path';

// Diretório onde os arquivos são armazenados temporariamente
const uploadDir = path.join(__dirname, '../uploads');  // Caminho absoluto para a pasta 'uploads' na raiz

// Função para criar (salvar) arquivo
export const createFile = (file: Express.Multer.File) => {
  const filePath = path.join(uploadDir, file.filename);
  return {
    filename: file.filename,
    path: filePath,
    mimetype: file.mimetype,
    size: file.size,
  };
};

// Função para listar todos os arquivos
export const listFiles = () => {
  const files = fs.readdirSync(uploadDir); // Lê os arquivos no diretório de uploads
  
  // Adiciona log para verificar se arquivos foram encontrados
  if (files.length === 0) {
    console.log("Nenhum arquivo encontrado no diretório de uploads.");
  } else {
    console.log("Arquivos encontrados:", files);  // Log para mostrar os arquivos encontrados
  }

  return files.map((filename) => ({
    filename,
    path: path.join(uploadDir, filename),  // Caminho absoluto para o arquivo
  }));
};

// Função para deletar arquivo por nome
export const deleteFile = (filename: string) => {
  const filePath = path.join(uploadDir, filename);  // Caminho completo do arquivo que será deletado

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);  // Remove o arquivo
    return { filename };  // Retorna o nome do arquivo deletado
  }

  return null;  // Se o arquivo não existir, retorna null
};