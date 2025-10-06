import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { S3Module } from '../../infra/external/s3.module';

@Module({
  imports: [S3Module],
  providers: [FileService],
  controllers: [FileController],
})
export class FileModule {}
