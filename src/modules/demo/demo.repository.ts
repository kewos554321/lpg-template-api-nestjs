import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DemoEntity } from './entities/demo.entity';

@Injectable()
export class DemoRepository {
  constructor(
    @InjectRepository(DemoEntity)
    private readonly repo: Repository<DemoEntity>,
  ) {}

  async createDemo(payload: Pick<DemoEntity, 'name' | 'isActive'>): Promise<DemoEntity> {
    const entity = this.repo.create(payload);
    return this.repo.save(entity);
  }

  findAll(): Promise<DemoEntity[]> {
    return this.repo.find();
  }

  findById(id: string): Promise<DemoEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async updateById(id: string, changes: Partial<Pick<DemoEntity, 'name' | 'isActive'>>): Promise<DemoEntity | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    Object.assign(existing, changes);
    return this.repo.save(existing);
  }

  async deleteById(id: string): Promise<boolean> {
    const res = await this.repo.delete(id);
    return (res.affected || 0) > 0;
  }
}
