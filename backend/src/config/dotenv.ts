import dotenv from 'dotenv';

dotenv.config();

// Construct database URL dynamically if not provided explicitly
const constructDatabaseUrl = (): string => {
  const defaultUrl = process.env.DATABASE_URL;
  if (defaultUrl) return defaultUrl;

  const host = process.env.MONGO_HOST || (process.env.NODE_ENV === 'production' ? 'mongodb' : 'localhost');
  const port = process.env.MONGO_PORT || '27017';
  const username = process.env.MONGO_USERNAME;
  const password = process.env.MONGO_PASSWORD;
  const database = process.env.MONGO_DATABASE;
  const authSource = process.env.MONGO_AUTH_SOURCE || 'admin';

  if (!host || !port || !username || !password || !database) {
    throw new Error('Missing required MongoDB environment variables');
  }
  
  return `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=${authSource}&directConnection=true`;
};

export const config = {
  secretKey: process.env.SECRET_KEY as string,
  port: process.env.BACKEND_PORT,
  databaseUrl: constructDatabaseUrl(),
  apiLink: process.env.API_LINK,
  nodeEnv: process.env.NODE_ENV,
  frontendUrl: process.env.FRONTEND_URL,
  awsRegion: process.env.AWS_REGION,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsS3BucketName: process.env.AWS_S3_BUCKET_NAME
};