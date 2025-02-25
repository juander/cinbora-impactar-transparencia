class Ong {
  id!: number;
  name!: string;
  description!: string;
  is_formalized!: boolean;
  start_year!: number;
  contact_phone!: string;
  instagram_link!: string;
  x_link!: string;
  facebook_link!: string;
  pix_qr_code_link!: string;
  gallery_images_url!: string[];

  constructor(props: Omit<Ong, 'id'>, id?: number) {
    Object.assign(this, props);
    if (id) {
      this.id = id;
    }
  }
}

export { Ong };
