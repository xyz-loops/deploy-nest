import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Request, Express } from 'express';
import { multerOptions } from 'src/config/multer-options.config';
import { BudgetUploadService } from './budget-upload.service';
// import { UpdateBudgetDto } from './dtos/update-budget.dto';
import { ItemsBudgetUploadDto } from './dto/budget-upload.dto';
import { SavaSimulate } from './dto/save-simulate.dto';
@Controller({
  version: '1',
  path: 'api/budget',
})
export class BudgetUploadController {
  constructor(private readonly budgetUploadService: BudgetUploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadDataBleed<T>(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response<T, Record<string, T>>> {
    try {
      const payload =
        await this.budgetUploadService.convertBudgetUploadFromExcelToJson(req);
      return res.status(201).json({
        data: payload,
        meta: {
          fileName: req?.file?.originalname,
          status: 'OK',
        },
        message: 'Data has been converted & saved',
        time: new Date(),
      });
    } catch (error) {
      return res.status(400).json(error.response);
    }
  }

  @Get('/all/filter')
  async findFilterBudget(@Query() queryParams: any, @Res() res: Response) {
    try {
      const findFilterBudget =
        await this.budgetUploadService.getViewBudget(queryParams);
      const findActual =
        await this.budgetUploadService.getActualRealization(queryParams);
      return res.status(200).json({
        budget: findFilterBudget,
        actual: findActual,
        remaining: null,
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

  @Get('/all')
  async findAllBudget(@Res() res: Response) {
    try {
      const findAllBudget = await this.budgetUploadService.getAllBudget();
      return res.status(200).json({
        data: findAllBudget,
        meta: {
          status: 'OK',
        },
        message: 'Data find all',
        time: new Date(),
      });
    } catch (error) {}
  }

  @Get('/count')
  async countIndicator(@Query() queryParams: any) {
    const budget = await this.budgetUploadService.countingBudget(queryParams);
    const actual =
      await this.budgetUploadService.countingRealization(queryParams);
    const remainingTotal =
      await this.budgetUploadService.calculateRemainingTotal(queryParams);
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

  @Get('/tables')
  async tableAll(@Query() queryParams: any) {
    const budget = await this.budgetUploadService.getViewBudget(queryParams);
    const actual =
      await this.budgetUploadService.getActualRealization(queryParams);
    const remainingTotal =
      await this.budgetUploadService.getRemainingTable(queryParams);
    return {
      data: {
        budget,
        actual,
        remainingTotal,
      },
      meta: {
        status: 'OK',
      },
      message: 'Data has been converted & saved',
      time: new Date(),
    };
  }

  @Post('/savesimulate')
  findAll(@Body() dto: SavaSimulate) {
    return this.budgetUploadService.saveSimulate(dto);
  }

  @Get('/get')
  getPercentage() {
    return this.budgetUploadService.getSimulationBudget();
  }

  @Get('/budgetactual')
  async getBudgetAndActual(@Query() queryParams: any) {
    try {
      const result =
        await this.budgetUploadService.getRemainingTable(queryParams);
      return { success: true, data: result };
    } catch (error) {
      // Handle errors and return an appropriate response
      return { success: false, error: 'An error occurred' };
    }
  }
}
