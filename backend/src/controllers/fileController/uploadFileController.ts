import { FastifyRequest, FastifyReply } from 'fastify';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

class UploadFileController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const data = await request.file();
    if (!data) {
      reply.status(400).send({ error: 'No file uploaded' });
      return;
    }

    const fileBuffer = await data.toBuffer();
    const fileStream = Readable.from(fileBuffer);

    try {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ public_id: data.filename }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });

        fileStream.pipe(uploadStream);
      });

      reply.send(uploadResult);
    } catch (error) {
      reply.status(500).send({ error: 'Error uploading file' });
    }
  }
}

export { UploadFileController };