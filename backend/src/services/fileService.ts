interface File {
    id: number;
    name: string;
    path: string;
    mimetype: string;
    size: number;
    userId: number;
  }
  
  let files: File[] = []; // Banco de dados simulado em memória
  let currentId = 1; // Contador para IDs de arquivos
  
  export const createFile = (name: string, path: string, mimetype: string, size: number, userId: number): File => {
    const newFile: File = {
      id: currentId++,
      name,
      path,
      mimetype,
      size,
      userId,
    };
    files.push(newFile);
    return newFile;
  };
  
  export const listFiles = (): File[] => {
    return files;
  };
  
  export const deleteFile = (id: number): File | null => {
    const index = files.findIndex(file => file.id === id);
    if (index === -1) return null;
    
    const deletedFile = files.splice(index, 1)[0];
    return deletedFile;
  };
  