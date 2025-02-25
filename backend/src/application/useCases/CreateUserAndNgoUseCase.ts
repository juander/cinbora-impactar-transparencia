import prismaClient from "../../infrastructure/prisma";

interface CreateUserAndNgoProps {
  user: {
    name: string;
    email: string;
  };
  ngo: {
    id: number;
    name: string;
    description: string;
    is_formalized: boolean;
    start_year: number;
    contact_phone: string;
    instagram_link: string;
    x_link: string;
    facebook_link: string;
    pix_qr_code_link: string;
    gallery_images_url: string[];
  };
}

class CreateUserAndNgoUseCase {
  async execute({ user, ngo }: CreateUserAndNgoProps) {
    let existingNgo = await prismaClient.ngo.findUnique({
      where: { id: ngo.id },
      include: { users: true }
    });

    if (!existingNgo) {
      existingNgo = await prismaClient.ngo.create({
        data: {
          ...ngo,
          users: {
            create: {
              name: user.name,
              email: user.email
            }
          }
        },
        include: { users: true }
      });
    } else {
      const userExists = existingNgo.users.some(u => u.email === user.email);
      if (!userExists) {
        await prismaClient.user.create({
          data: {
            name: user.name,
            email: user.email,
            ngoId: existingNgo.id
          }
        });
      }
    }

    return { user, ngo: existingNgo };
  }
}

export { CreateUserAndNgoUseCase };
