
import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

@Injectable()
export class FileService {
  private readonly inMemoryFiles: Map<string, {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;
  }>;
  constructor() {
    this.inMemoryFiles = new Map<string, {
      buffer: Buffer;
      originalName: string;
      mimeType: string;
      size: number;
      uploadedAt: Date;
    }>();

  }

  saveFile(file: { buffer: Buffer; originalname: string; mimetype: string; size: number }) {
    const id = randomUUID();
    this.inMemoryFiles.set(id, {
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
    });
    return { id, originalName: file.originalname, size: file.size, mimeType: file.mimetype };
  }

  getFile(id: string) {
    const entry = this.inMemoryFiles.get(id);
    if (!entry) throw new NotFoundException('File not found');
    return entry;
  }
}
