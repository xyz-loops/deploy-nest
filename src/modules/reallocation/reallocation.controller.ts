import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ReallocationService } from './reallocation.service';
import { CreateReallocationDto } from './dto/create-reallocation.dto';
import { UpdateReallocationDto } from './dto/update-reallocation.dto';

@Controller('reallocation')
export class ReallocationController {
  constructor(private readonly reallocationService: ReallocationService) {}

  @Get()
  findAll() {
    return this.reallocationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reallocationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReallocationDto: UpdateReallocationDto,
  ) {
    return this.reallocationService.update(+id, updateReallocationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reallocationService.remove(+id);
  }
}
