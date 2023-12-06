import { Injectable } from '@nestjs/common';
import { CreateRealizationDto } from './dto/create-realization.dto';
import { UpdateRealizationDto } from './dto/update-realization.dto';

@Injectable()
export class RealizationService {
  create(createRealizationDto: CreateRealizationDto) {
    return 'This action adds a new realization';
  }

  findAll() {
    return `This action returns all realization`;
  }

  findOne(id: number) {
    return `This action returns a #${id} realization`;
  }

  update(id: number, updateRealizationDto: UpdateRealizationDto) {
    return `This action updates a #${id} realization`;
  }

  remove(id: number) {
    return `This action removes a #${id} realization`;
  }
}
