import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemoEntity } from './entities/demo.entity';
import { DemoRepository } from './demo.repository';
import { DemoService } from './demo.service';
import { DemoController } from './demo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DemoEntity])],
  providers: [DemoRepository, DemoService],
  controllers: [DemoController],
})
export class DemoModule {}
