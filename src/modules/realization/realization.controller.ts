import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RealizationService } from './realization.service';
import { CreateRealizationDto } from './dto/create-realization.dto';
import { UpdateRealizationDto } from './dto/update-realization.dto';

@Controller('realization')
export class RealizationController {
  constructor(private readonly realizationService: RealizationService) {}

  @Post()
  create(@Body() createRealizationDto: CreateRealizationDto) {
    return this.realizationService.create(createRealizationDto);
  }

  @Get()
  findAll() {
    return this.realizationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.realizationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRealizationDto: UpdateRealizationDto) {
    return this.realizationService.update(+id, updateRealizationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.realizationService.remove(+id);
  }
}
