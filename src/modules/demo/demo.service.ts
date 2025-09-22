import { Injectable, NotFoundException } from '@nestjs/common';
import { DemoRepository } from './demo.repository';
import { DemoEntity } from './entities/demo.entity';

@Injectable()
export class DemoService {
  constructor(private readonly demoRepository: DemoRepository) {}

  create(data: Pick<DemoEntity, 'name' | 'isActive'>) {
    return this.demoRepository.createDemo(data);
  }

  findAll() {
    return this.demoRepository.findAll();
  }

  async findOne(id: string) {
    const item = await this.demoRepository.findById(id);
    if (!item) throw new NotFoundException('Demo not found');
    return item;
  }

  async update(id: string, data: Partial<Pick<DemoEntity, 'name' | 'isActive'>>) {
    const updated = await this.demoRepository.updateById(id, data);
    if (!updated) throw new NotFoundException('Demo not found');
    return updated;
  }

  async remove(id: string) {
    const ok = await this.demoRepository.deleteById(id);
    if (!ok) throw new NotFoundException('Demo not found');
    return { success: true };
  }
}
