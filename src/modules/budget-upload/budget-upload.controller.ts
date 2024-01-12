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
        await this.budgetUploadService.viewBudget(queryParams);
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
    return {
      // data: budget,
      data2: actual,
      meta: {
        status: 'OK',
      },
      message: 'Data has been converted & saved',
      time: new Date(),
    };
  }
}
