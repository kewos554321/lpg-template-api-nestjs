import { Module } from '@nestjs/common';
import { LiffController } from './liff.controller';

@Module({
  controllers: [LiffController],
})
export class LiffModule {}
