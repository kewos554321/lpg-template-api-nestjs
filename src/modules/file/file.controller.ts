import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  Res,
  Header,
  Query,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { S3Service } from '../../infra/external/s3.service';

@ApiTags('files')
@Controller('files')
export class FileController {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file to S3' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a file to S3',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        key: {
          type: 'string',
          description: 'Optional custom key for the file',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(
    @UploadedFile() file: any,
    @Body('key') key?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const fileKey = key || `uploads/${Date.now()}-${file.originalname}`;
    
    const result = await this.s3Service.upload({
      key: fileKey,
      body: file.buffer,
      contentType: file.mimetype,
      metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    });

    return {
      message: 'File uploaded successfully',
      key: fileKey,
      url: result,
      size: file.size,
      contentType: file.mimetype,
    };
  }

  @Get('download/:key')
  @ApiOperation({ summary: 'Download a file from S3' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @Header('Content-Type', 'application/octet-stream')
  @Header('Content-Disposition', 'attachment')
  async downloadFile(@Param('key') key: string, @Res() res: Response) {
    try {
      // API Gateway encodes '/' as '%2F' in path params; decode before use
      const decodedKey = decodeURIComponent(key);
      // First check if file exists
      const exists = await this.s3Service.exists({ key: decodedKey });
      if (!exists) {
        throw new NotFoundException(`File with key ${decodedKey} not found`);
      }

      const fileBuffer = await this.s3Service.download({ key: decodedKey });
      
      // Extract filename from key
      const fileName = decodedKey.split('/').pop() || 'download';
      
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', fileBuffer.length);
      
      res.send(fileBuffer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`File with key ${decodeURIComponent(key)} not found: ${error.message}`);
    }
  }

  // Alternative download endpoint using query param to avoid API Gateway path decoding issues
  @Get('download')
  @ApiOperation({ summary: 'Download a file from S3 (via query parameter key)' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @Header('Content-Type', 'application/octet-stream')
  @Header('Content-Disposition', 'attachment')
  async downloadFileByQuery(@Query('key') rawKey: string, @Res() res: Response) {
    const key = decodeURIComponent(rawKey || '');
    if (!key) {
      throw new BadRequestException('Missing key');
    }
    try {
      const exists = await this.s3Service.exists({ key });
      if (!exists) {
        throw new NotFoundException(`File with key ${key} not found`);
      }
      console.log('key=', key);
      const fileBuffer = await this.s3Service.download({ key });
      const fileName = key.split('/').pop() || 'download';
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', fileBuffer.length);
      res.send(fileBuffer);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new NotFoundException(`File with key ${key} not found: ${error.message}`);
    }
  }

  @Get('info/:key')
  @ApiOperation({ summary: 'Get file info and base64 content from S3' })
  @ApiResponse({ status: 200, description: 'File info returned successfully' })
  async getFileInfo(@Param('key') key: string) {
    try {
      const decodedKey = decodeURIComponent(key);
      const fileBuffer = await this.s3Service.download({ key: decodedKey });
      
      return {
        key: decodedKey,
        data: fileBuffer.toString('base64'),
        size: fileBuffer.length,
      };
    } catch (error) {
      throw new NotFoundException(`File with key ${decodeURIComponent(key)} not found`);
    }
  }

  @Get('presigned-upload/:key')
  @ApiOperation({ summary: 'Get presigned URL for uploading' })
  @ApiResponse({ status: 200, description: 'Presigned URL generated successfully' })
  async getPresignedUploadUrl(
    @Param('key') key: string,
    @Body('contentType') contentType: string = 'application/octet-stream',
  ) {
    const decodedKey = decodeURIComponent(key);
    const url = await this.s3Service.getPresignedUploadUrl(decodedKey, contentType);
    
    return {
      key: decodedKey,
      uploadUrl: url,
      expiresIn: 3600,
    };
  }

  @Get('presigned-download/:key')
  @ApiOperation({ summary: 'Get presigned URL for downloading' })
  @ApiResponse({ status: 200, description: 'Presigned URL generated successfully' })
  async getPresignedDownloadUrl(@Param('key') key: string) {
    const decodedKey = decodeURIComponent(key);
    const url = await this.s3Service.getPresignedDownloadUrl(decodedKey);
    
    return {
      key: decodedKey,
      downloadUrl: url,
      expiresIn: 3600,
    };
  }

  @Get('list')
  @ApiOperation({ summary: 'List files in S3 bucket' })
  @ApiResponse({ status: 200, description: 'Files listed successfully' })
  async listFiles(
    @Body('prefix') prefix?: string,
    @Body('maxKeys') maxKeys?: number,
  ) {
    try {
      const files = await this.s3Service.list({ prefix, maxKeys });
      
      return {
        files,
        count: files.length,
        bucket: this.s3Service['defaultBucket'],
      };
    } catch (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  @Get('exists/:key')
  @ApiOperation({ summary: 'Check if file exists in S3' })
  @ApiResponse({ status: 200, description: 'File existence checked' })
  async checkFileExists(@Param('key') key: string) {
    const decodedKey = decodeURIComponent(key);
    const exists = await this.s3Service.exists({ key: decodedKey });
    
    return {
      key: decodedKey,
      exists,
    };
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a file from S3' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Param('key') key: string) {
    try {
      const decodedKey = decodeURIComponent(key);
      await this.s3Service.delete({ key: decodedKey });
      
      return {
        message: 'File deleted successfully',
        key: decodedKey,
      };
    } catch (error) {
      throw new NotFoundException(`File with key ${decodeURIComponent(key)} not found`);
    }
  }
}