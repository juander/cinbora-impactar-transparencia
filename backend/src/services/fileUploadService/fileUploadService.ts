import cloudinary from '../../config/cloudinaryConfig';

class FileUploadService {
    async uploadFile(fileBuffer: Buffer, publicId: string) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ public_id: publicId }, (error, result) => {
                if (error) {
                    reject(new Error('Error uploading file'));
                } else {
                    resolve(result);
                }
            });

            uploadStream.end(fileBuffer);
        });
    }

    getOptimizedUrl(publicId: string) {
        return cloudinary.url(publicId, {
            fetch_format: 'auto',
            quality: 'auto',
        });
    }
    
}

export default FileUploadService;