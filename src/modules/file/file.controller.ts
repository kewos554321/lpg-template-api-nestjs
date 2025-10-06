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
  @Header('Content-Type', 'application/octet-stream')
  @Header('Content-Disposition', 'attachment')
  async downloadFile(@Param('key') key: string, @Res() res: Response) {
    try {
      const fileBuffer = await this.s3Service.download({ key });
      
      // Extract filename from key
      const fileName = key.split('/').pop() || 'download';
      
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', fileBuffer.length);
      
      res.send(fileBuffer);
    } catch (error) {
      throw new NotFoundException(`File with key ${key} not found`);
    }
  }

  @Get('info/:key')
  @ApiOperation({ summary: 'Get file info and base64 content from S3' })
  @ApiResponse({ status: 200, description: 'File info returned successfully' })
  async getFileInfo(@Param('key') key: string) {
    try {
      const fileBuffer = await this.s3Service.download({ key });
      
      return {
        key,
        data: fileBuffer.toString('base64'),
        size: fileBuffer.length,
      };
    } catch (error) {
      throw new NotFoundException(`File with key ${key} not found`);
    }
  }

  @Get('presigned-upload/:key')
  @ApiOperation({ summary: 'Get presigned URL for uploading' })
  @ApiResponse({ status: 200, description: 'Presigned URL generated successfully' })
  async getPresignedUploadUrl(
    @Param('key') key: string,
    @Body('contentType') contentType: string = 'application/octet-stream',
  ) {
    const url = await this.s3Service.getPresignedUploadUrl(key, contentType);
    
    return {
      key,
      uploadUrl: url,
      expiresIn: 3600,
    };
  }

  @Get('presigned-download/:key')
  @ApiOperation({ summary: 'Get presigned URL for downloading' })
  @ApiResponse({ status: 200, description: 'Presigned URL generated successfully' })
  async getPresignedDownloadUrl(@Param('key') key: string) {
    const url = await this.s3Service.getPresignedDownloadUrl(key);
    
    return {
      key,
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
    const files = await this.s3Service.list({ prefix, maxKeys });
    
    return {
      files,
      count: files.length,
    };
  }

  @Get('exists/:key')
  @ApiOperation({ summary: 'Check if file exists in S3' })
  @ApiResponse({ status: 200, description: 'File existence checked' })
  async checkFileExists(@Param('key') key: string) {
    const exists = await this.s3Service.exists({ key });
    
    return {
      key,
      exists,
    };
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a file from S3' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Param('key') key: string) {
    try {
      await this.s3Service.delete({ key });
      
      return {
        message: 'File deleted successfully',
        key,
      };
    } catch (error) {
      throw new NotFoundException(`File with key ${key} not found`);
    }
  }
}