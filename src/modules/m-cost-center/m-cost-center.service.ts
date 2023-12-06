import { Injectable } from '@nestjs/common';
import { CreateMCostCenterDto } from './dto/create-m-cost-center.dto';
import { UpdateMCostCenterDto } from './dto/update-m-cost-center.dto';

@Injectable()
export class MCostCenterService {
  create(createMCostCenterDto: CreateMCostCenterDto) {
    return 'This action adds a new mCostCenter';
  }

  findAll() {
    return `This action returns all mCostCenter`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mCostCenter`;
  }

  update(id: number, updateMCostCenterDto: UpdateMCostCenterDto) {
    return `This action updates a #${id} mCostCenter`;
  }

  remove(id: number) {
    return `This action removes a #${id} mCostCenter`;
  }
}
