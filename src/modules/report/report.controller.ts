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

  @Get('/budget')
  async filterViewBudget(@Query() queryParams: any, @Res() res: Response) {
    try {
      const budget = await this.reportService.getViewBudget(queryParams);
      const actual = await this.reportService.getActualRealization(queryParams);
      const remainingBudget =
        await this.reportService.getRemainingTable(queryParams);
      return res.status(200).json({
        budget,
        actual,
        remainingBudget,
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
  findSummaryWithPaginationAndFilter(
    @Query('page') page: number,
    @Query('orderBy') orderBy: string,
    @Query() queryParams: any,
  ) {
    return this.reportService.findRealizationFilter(page, orderBy, queryParams);
  }

  @Get('all/requestby/')
  findRequestBy() {
    return this.reportService.groupingRequestBy();
  }

  @Get('all/responsible/')
  findResponsibleNopeg() {
    return this.reportService.groupingResponsibleNopeg();
  }

  @Get('/count')
  async countIndicator(@Query() queryParams: any) {
    const budget = await this.reportService.countingBudget(queryParams);
    const actual = await this.reportService.countingRealization(queryParams);
    const remainingTotal =
      await this.reportService.calculateRemainingTotal(queryParams);
    return {
      data: {
        BudgetMTD: budget.BudgetMTD,
        BudgetYTD: budget.BudgetYTD,
        ActualMTD: actual.ActualMTD,
        ActualYTD: actual.ActualYTD,
        RemainingTotal: remainingTotal,
      },
      meta: {
        status: 'OK',
      },
      message: 'Data has been converted & saved',
      time: new Date(),
    };
  }
}
