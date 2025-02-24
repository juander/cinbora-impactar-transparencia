import { FastifyRequest, FastifyReply } from "fastify";
import { GridFSBucket } from "mongodb";
import prismaClient from "../../prisma/prismaClient";
import { connectToDatabase } from "../../config/mongoClient";

declare module "fastify" {
  interface FastifyRequest {
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    };
  }
}

class UploadFileController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { ngoId } = request.body as { ngoId: string };
    const file = request.file;
    if (!file) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    const db = await connectToDatabase();
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

    const uploadStream = bucket.openUploadStream(file.originalname);
    uploadStream.end(file.buffer);

    uploadStream.on('finish', async () => {
      const fileId = uploadStream.id.toString();
      const fileMetadata = await prismaClient.fileMetadata.create({
        data: {
          nome: file.originalname,
          tipo: file.mimetype,
          tamanho: file.size,
          ngoId: ngoId,
          gridFSId: fileId,
        },
      });
      reply.send(fileMetadata);
    });

    uploadStream.on('error', (error) => {
      reply.status(500).send({ error: error.message });
    });
  }
}

export { UploadFileController };