import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { Response } from 'express';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Controller({
  version: '1',
  path: 'api/report',
})
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportService.create(createReportDto);
  }

  @Get('/budget')
  async findFilterBudget(@Query() queryParams: any, @Res() res: Response) {
    try {
      const findFilterBudget =
        await this.reportService.getAllBudget(queryParams);
      return res.status(200).json({
        data: findFilterBudget,
        meta: {
          status: 'OK',
        },
        message: 'Data found',
        time: new Date(),
      });
    } catch (error) {
      return res.status(400).json(error.response);
    }
  }

  @Get('/summary')
  findAllWithPaginationAndFilter(
    @Query('page') page: number,
    @Query('orderBy') orderBy: string,
    @Query() queryParams: any,
  ) {
    return this.reportService.findAllWithPaginationAndFilter(
      page,
      orderBy,
      queryParams,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportService.update(+id, updateReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportService.remove(+id);
  }
}
