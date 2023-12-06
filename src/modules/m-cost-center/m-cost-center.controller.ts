import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MCostCenterService } from './m-cost-center.service';
import { CreateMCostCenterDto } from './dto/create-m-cost-center.dto';
import { UpdateMCostCenterDto } from './dto/update-m-cost-center.dto';

@Controller('m-cost-center')
export class MCostCenterController {
  constructor(private readonly mCostCenterService: MCostCenterService) {}

  @Post()
  create(@Body() createMCostCenterDto: CreateMCostCenterDto) {
    return this.mCostCenterService.create(createMCostCenterDto);
  }

  @Get()
  findAll() {
    return this.mCostCenterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mCostCenterService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMCostCenterDto: UpdateMCostCenterDto) {
    return this.mCostCenterService.update(+id, updateMCostCenterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mCostCenterService.remove(+id);
  }
}
