import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DemoService } from './demo.service';

@ApiTags('Demo')
@Controller('demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Post()
  create(@Body() body: { name: string; isActive?: boolean }) {
    return this.demoService.create({ name: body.name, isActive: body.isActive ?? true });
  }

  @Get()
  findAll() {
    return this.demoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.demoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; isActive?: boolean },
  ) {
    return this.demoService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.demoService.remove(id);
  }
}
