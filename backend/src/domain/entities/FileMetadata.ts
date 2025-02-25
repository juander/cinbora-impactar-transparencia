class FileMetadata {
  id!: string;
  nome!: string;
  tipo!: string;
  tamanho!: number;
  ngoId!: number;
  gridFSId!: string;

  constructor(props: Omit<FileMetadata, 'id'>, id?: string) {
    Object.assign(this, props);
    if (id) {
      this.id = id;
    }
  }
}

export { FileMetadata };
