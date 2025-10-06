import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface S3UploadOptions {
  bucket?: string;
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface S3DownloadOptions {
  bucket?: string;
  key: string;
}

export interface S3ListOptions {
  bucket?: string;
  prefix?: string;
  maxKeys?: number;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly defaultBucket: string;

  constructor(private readonly configService: ConfigService) {
    const s3Config = this.configService.get('s3');
    
    this.s3Client = new S3Client({
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
      endpoint: s3Config.endpoint,
      forcePathStyle: s3Config.forcePathStyle,
    });

    this.defaultBucket = s3Config.bucketName;
  }

  /**
   * Upload a file to S3
   */
  async upload(options: S3UploadOptions): Promise<string> {
    const bucket = options.bucket || this.defaultBucket;
    
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: options.key,
        Body: options.body,
        ContentType: options.contentType,
        Metadata: options.metadata,
      });

      await this.s3Client.send(command);
      
      this.logger.log(`File uploaded successfully: ${options.key}`);
      return `s3://${bucket}/${options.key}`;
    } catch (error) {
      this.logger.error(`Failed to upload file ${options.key}:`, error);
      throw error;
    }
  }

  /**
   * Download a file from S3
   */
  async download(options: S3DownloadOptions): Promise<Buffer> {
    const bucket = options.bucket || this.defaultBucket;
    
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: options.key,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Body) {
        throw new Error('No body in response');
      }

      const chunks: Uint8Array[] = [];
      const stream = response.Body as any;
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      
      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error(`Failed to download file ${options.key}:`, error);
      throw error;
    }
  }

  /**
   * Delete a file from S3
   */
  async delete(options: S3DownloadOptions): Promise<void> {
    const bucket = options.bucket || this.defaultBucket;
    
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: options.key,
      });

      await this.s3Client.send(command);
      
      this.logger.log(`File deleted successfully: ${options.key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${options.key}:`, error);
      throw error;
    }
  }

  /**
   * Check if a file exists in S3
   */
  async exists(options: S3DownloadOptions): Promise<boolean> {
    const bucket = options.bucket || this.defaultBucket;
    
    try {
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: options.key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * List objects in S3 bucket
   */
  async list(options: S3ListOptions = {}): Promise<string[]> {
    const bucket = options.bucket || this.defaultBucket;
    
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: options.prefix,
        MaxKeys: options.maxKeys,
      });

      const response = await this.s3Client.send(command);
      
      return response.Contents?.map(obj => obj.Key || '') || [];
    } catch (error) {
      this.logger.error(`Failed to list objects:`, error);
      throw error;
    }
  }

  /**
   * Generate a presigned URL for uploading
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600,
    bucket?: string
  ): Promise<string> {
    const targetBucket = bucket || this.defaultBucket;
    
    try {
      const command = new PutObjectCommand({
        Bucket: targetBucket,
        Key: key,
        ContentType: contentType,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error(`Failed to generate presigned upload URL for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Generate a presigned URL for downloading
   */
  async getPresignedDownloadUrl(
    key: string,
    expiresIn: number = 3600,
    bucket?: string
  ): Promise<string> {
    const targetBucket = bucket || this.defaultBucket;
    
    try {
      const command = new GetObjectCommand({
        Bucket: targetBucket,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error(`Failed to generate presigned download URL for ${key}:`, error);
      throw error;
    }
  }
}
