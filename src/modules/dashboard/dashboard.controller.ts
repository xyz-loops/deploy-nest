import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Controller({
  version: '1',
  path: 'api/dashboard',
})
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  create(@Body() createDashboardDto: CreateDashboardDto) {
    return this.dashboardService.create(createDashboardDto);
  }

  @Get('/all')
  findAllWithPaginationAndFilter(
    @Query('page') page: number,
    @Query('orderBy') orderBy: string,
    @Query() queryParams: any,
  ) {
    return this.dashboardService.findAllWithPaginationAndFilter(
      page,
      orderBy,
      queryParams,
    );
  }

  // @Get()
  // findPaginated(
  //   @Query('page') page: number,
  //   @Query('perPage') perPage: number,
  // ) {
  //   return this.dashboardService.findAllPaginated(page, perPage);
  // }

  @Get('/type')
  async getRealizationTypeCounts() {
    const realizationTypeCounts =
      await this.dashboardService.getRealizationTypeCounts();
    return {
      data: realizationTypeCounts,
      message: 'Realization type counts retrieved',
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dashboardService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDashboardDto: UpdateDashboardDto,
  ) {
    return this.dashboardService.update(+id, updateDashboardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dashboardService.remove(+id);
  }
}
