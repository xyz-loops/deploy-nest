//Controller using try catch
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { KursService } from './kurs.service';
import { CreateKursDto } from './dto/create-kurs.dto';
import { UpdateKursDto } from './dto/update-kurs.dto';
import { dot } from 'node:test/reporters';

@Controller({
  version: '1',
  path: 'api/kurs',
})
export class KursController {
  constructor(private readonly kursService: KursService) {}

  @Post()
  async createKurs(@Body() dto: CreateKursDto) {
    try {
      const requiredFields = ['years', 'value', 'createdBy'];
      for (const field of requiredFields) {
        if (!dto[field]) {
          throw new HttpException(
            `Field ${field} is required`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      const typeValidations = {
        years: 'number',
        value: 'number',
        createdBy: 'string',
      };
      for (const field in typeValidations) {
        if (typeof dto[field] !== typeValidations[field]) {
          throw new HttpException(
            `Field ${field} must be a ${typeValidations[field]}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      const newKurs = await this.kursService.create(dto);
      return newKurs;
    } catch (error) {
      // Tangkap kesalahan dan lemparkan HttpException
      throw new HttpException(
        error.message || 'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/all')
  findAll() {
    return this.kursService.findAll();
  }

  @Get()
  findAllPaginated(
    @Query('page') page: number,
    @Query('orderBy') orderBy: string,
  ) {
    return this.kursService.findAllPaginated(page, orderBy);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.kursService.findOne(+id);
  }

  @Get('/years/:years')
  findYears(@Param('years') years: number) {
    return this.kursService.findYears(+years);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateKursDto: UpdateKursDto) {
    return this.kursService.update(+id, updateKursDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.kursService.remove(+id);
  }
}
