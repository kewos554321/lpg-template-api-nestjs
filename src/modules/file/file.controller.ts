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
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
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

  @Get('download')
  @ApiOperation({ summary: 'Download a file from S3' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @Header('Content-Type', 'application/octet-stream')
  @Header('Content-Disposition', 'attachment')
  @ApiQuery({ name: 'key', required: true, description: 'Object key in S3' })
  async downloadFile(@Query('key') rawKey: string, @Res() res: Response) {
    const key = decodeURIComponent(rawKey || '');
    if (!key) {
      throw new BadRequestException('Missing key');
    }
    try {
      const exists = await this.s3Service.exists({ key });
      if (!exists) {
        throw new NotFoundException(`File with key ${key} not found`);
      }
      
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

  @Get('download-redirect')
  @ApiOperation({ summary: 'Redirect to a presigned S3 download URL (exact bytes, safest)' })
  @ApiResponse({ status: 302, description: 'Redirected to S3' })
  @ApiQuery({ name: 'key', required: true, description: 'Object key in S3' })
  async downloadRedirect(@Query('key') rawKey: string, @Res() res: Response) {
    const key = decodeURIComponent(rawKey || '');
    if (!key) {
      throw new BadRequestException('Missing key');
    }
    const exists = await this.s3Service.exists({ key });
    if (!exists) {
      throw new NotFoundException(`File with key ${key} not found`);
    }
    const url = await this.s3Service.getPresignedDownloadUrl(key, 300);
    res.redirect(302, url);
  }

  @Get('info')
  @ApiOperation({ summary: 'Get file info and base64 content from S3' })
  @ApiResponse({ status: 200, description: 'File info returned successfully' })
  @ApiQuery({ name: 'key', required: true, description: 'Object key in S3' })
  async getFileInfo(@Query('key') rawKey: string) {
    const key = decodeURIComponent(rawKey || '');
    if (!key) {
      throw new BadRequestException('Missing key');
    }
    try {
      const fileBuffer = await this.s3Service.download({ key });
      
      return {
        key: key,
        data: fileBuffer.toString('base64'),
        size: fileBuffer.length,
      };
    } catch (error) {
      throw new NotFoundException(`File with key ${key} not found`);
    }
  }

  @Get('presigned-upload')
  @ApiOperation({ summary: 'Get presigned URL for uploading' })
  @ApiResponse({ status: 200, description: 'Presigned URL generated successfully' })
  @ApiQuery({ name: 'key', required: true, description: 'Object key in S3' })
  @ApiQuery({ name: 'contentType', required: false, description: 'Content type of the file' })
  async getPresignedUploadUrl(
    @Query('key') rawKey: string,
    @Query('contentType') contentType: string = 'application/octet-stream',
  ) {
    const key = decodeURIComponent(rawKey || '');
    if (!key) {
      throw new BadRequestException('Missing key');
    }
    const url = await this.s3Service.getPresignedUploadUrl(key, contentType);
    
    return {
      key: key,
      uploadUrl: url,
      expiresIn: 3600,
    };
  }

  @Get('presigned-download')
  @ApiOperation({ summary: 'Get presigned URL for downloading' })
  @ApiResponse({ status: 200, description: 'Presigned URL generated successfully' })
  @ApiQuery({ name: 'key', required: true, description: 'Object key in S3' })
  async getPresignedDownloadUrl(@Query('key') rawKey: string) {
    const key = decodeURIComponent(rawKey || '');
    if (!key) {
      throw new BadRequestException('Missing key');
    }
    const url = await this.s3Service.getPresignedDownloadUrl(key);
    
    return {
      key: key,
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

  @Get('exists')
  @ApiOperation({ summary: 'Check if file exists in S3' })
  @ApiResponse({ status: 200, description: 'File existence checked' })
  @ApiQuery({ name: 'key', required: true, description: 'Object key in S3' })
  async checkFileExists(@Query('key') rawKey: string) {
    const key = decodeURIComponent(rawKey || '');
    if (!key) {
      throw new BadRequestException('Missing key');
    }
    const exists = await this.s3Service.exists({ key });
    return { key, exists };
  }

  @Delete()
  @ApiOperation({ summary: 'Delete a file from S3' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiQuery({ name: 'key', required: true, description: 'Object key in S3' })
  async deleteFile(@Query('key') rawKey: string) {
    const key = decodeURIComponent(rawKey || '');
    if (!key) {
      throw new BadRequestException('Missing key');
    }
    try {
      await this.s3Service.delete({ key });
      
      return {
        message: 'File deleted successfully',
        key: key,
      };
    } catch (error) {
      throw new NotFoundException(`File with key ${key} not found`);
    }
  }
}