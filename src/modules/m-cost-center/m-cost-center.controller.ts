import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MCostCenterService } from './m-cost-center.service';
import { CreateMCostCenterDto } from './dto/create-m-cost-center.dto';
import { UpdateMCostCenterDto } from './dto/update-m-cost-center.dto';

@Controller({
  version: '1',
  path: 'api/m-cost-center',
})
export class MCostCenterController {
  constructor(private readonly mCostCenterService: MCostCenterService) {}

  @Post()
  async create(@Body() dto: CreateMCostCenterDto) {
    try {
      const requiredFields = [
        'costCenter',
        'description',
        'bidang',
        'dinas',
        'directorat',
        'groupDinas',
        'profitCenter',
        'active',
      ];
      for (const field of requiredFields) {
        if (!dto[field]) {
          throw new HttpException(
            `Field ${field} is required`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      const typeValidations = {
        costCenter: 'string',
        description: 'string',
        bidang: 'string',
        dinas: 'string',
        directorat: 'string',
        groupDinas: 'string',
        profitCenter: 'string',
        active: 'boolean',
      };
      for (const field in typeValidations) {
        if (typeof dto[field] !== typeValidations[field]) {
          throw new HttpException(
            `Field ${field} must be a ${typeValidations[field]}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      const costCenters = await this.mCostCenterService.create(dto);
      return costCenters;
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
    return this.mCostCenterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mCostCenterService.findOne(+id);
  }

  @Get('all/group')
  groupCostCentersByDinas() {
    return this.mCostCenterService.groupingByDinas();
  }

  @Get('bidang/:bidang')
  findByBidang(@Param('bidang') bidang: string) {
    return this.mCostCenterService.findBidang(bidang);
  }

  @Get('dinas/:dinas')
  findByDinas(@Param('dinas') dinas: string, @Param('bidang') bidang: string) {
    return this.mCostCenterService.findDinas(dinas, bidang);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateMCostCenterDto: UpdateMCostCenterDto,
  ) {
    return this.mCostCenterService.update(+id, updateMCostCenterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mCostCenterService.remove(+id);
  }
}
