// S3 configuration
import { registerAs } from '@nestjs/config';

export default registerAs('s3', () => ({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  bucketName: process.env.S3_BUCKET_NAME,
  endpoint: process.env.S3_ENDPOINT, // For local development or custom S3-compatible services
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true', // For local development
  sslEnabled: process.env.S3_SSL_ENABLED !== 'false', // Default to true
}));
