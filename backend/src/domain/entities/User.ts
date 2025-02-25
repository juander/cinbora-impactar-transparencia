class User {
  id!: string;
  name!: string;
  email!: string;
  ngoId!: number;

  constructor(props: Omit<User, 'id'>, id?: string) {
    Object.assign(this, props);
    if (id) {
      this.id = id;
    }
  }
}

export { User };
