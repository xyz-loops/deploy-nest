import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MStatusService } from './m-status.service';
import { CreateMStatusDto } from './dto/create-m-status.dto';
import { UpdateMStatusDto } from './dto/update-m-status.dto';

@Controller({
  version: '1',
  path: 'api/status',
})
export class MStatusController {
  constructor(private readonly mStatusService: MStatusService) {}

  @Post()
  async create(@Body() data: CreateMStatusDto) {
    try {
      const newStatus = await this.mStatusService.create(data);
      return newStatus;
    } catch (error) {
      // Tangkap kesalahan dan lemparkan HttpException
      throw new HttpException(
        error.message || 'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  findAll() {
    return this.mStatusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mStatusService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateMStatusDtos: UpdateMStatusDto) {
    return this.mStatusService.update(+id, updateMStatusDtos);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mStatusService.remove(+id);
  }
}
