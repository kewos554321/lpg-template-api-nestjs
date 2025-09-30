import { Controller, Get, Param, Post, UploadedFile, UseInterceptors, Res, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import type { Response } from 'express';
import type { Multer } from 'multer';

@ApiTags('File')
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  // File upload (memory)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  uploadFile(@UploadedFile() file: Multer.File) {
    return this.fileService.saveFile({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });
  }

  // File download by id
  @Get('download/:id')
  @ApiOkResponse({ description: 'Returns the raw file content' })
  downloadFile(@Param('id') id: string, @Res() res: Response) {
    const entry = this.fileService.getFile(id);
    res.status(HttpStatus.OK);
    res.setHeader('Content-Type', entry.mimeType);
    res.setHeader('Content-Length', String(entry.size));
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(entry.originalName)}"`);
    return res.end(entry.buffer);
  }
}
