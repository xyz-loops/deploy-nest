import { BadRequestException, Injectable } from '@nestjs/common';
import { catchError, lastValueFrom, mergeMap, of } from 'rxjs';
import * as fs from 'fs-extra';
import { Request } from 'express';
import { MessagesInvalidDataError } from 'src/core/errors/invalid-data.error';
import { BudgetUploadProcessExcelToJsonBuilder } from 'src/core/utils/budget-upload-process-excel-to-json-builder.util';
import { ReadExcelSheetBudgetUploadBuilder } from 'src/core/utils/read-excel-sheet-budget-upload-builder.util';
import { BudgetUploadSheetsDto } from './dto/budget-upload-sheets.dto';
import { ItemsBudgetUploadDto } from './dto/budget-upload.dto';
import { ReadBudgetUploadSheetDto } from './dto/read-budget-upload.dto';

@Injectable()
export class ExcelBudgetUploadService {
  constructor(
    private readonly readBudgetUploadBuilder: ReadExcelSheetBudgetUploadBuilder,
    private readonly processExcelToJsonBuilder: BudgetUploadProcessExcelToJsonBuilder,
    private readonly readExcelSheetBudgetUploadBuilder: ReadExcelSheetBudgetUploadBuilder,
  ) {
    ExcelBudgetUploadService?.name;
  }

  async readFormatExcel(req: Request): Promise<ReadBudgetUploadSheetDto> {
    try {
      const budgetUploadSheet: BudgetUploadSheetsDto =
        this.readExcelSheetBudgetUploadBuilder
          .getSheetName('rkap')
          .ignoreHeaderRow()
          .setSheetNameToJsonFields(ItemsBudgetUploadDto.propertyNames)
          .setColumnPropertyToJsonFields(ItemsBudgetUploadDto.propertyConfig)
          .build();
      // const revenueSheet: BudgetUploadSheetsDto =
      //   this.readExcelSheetBudgetUploadBuilder
      //     .getSheetName('rkap')
      //     .ignoreHeaderRow()
      //     .setSheetNameToJsonFields(ItemsBudgetUploadDto.propertyNames)
      //     .setColumnPropertyToJsonFields(ItemsBudgetUploadDto.propertyConfig)
      //     .build();

      const filePath: string = req?.file?.path;
      const data = of(filePath).pipe(
        catchError((error) => {
          throw new BadRequestException(error);
        }),
        mergeMap(() =>
          this.processExcelToJsonBuilder
            .getFile(filePath)
            .addSheet(budgetUploadSheet)
            // .addSheet(revenueSheet)
            .build(req),
        ),
      );

      const result = await lastValueFrom(data);
      // await fs.remove(filePath);
      // console.log(req?.body?.years);
      return result;
    } catch (error) {
      const filePath: string = req?.file?.path;
      if (filePath) fs.remove(filePath);

      if (error instanceof MessagesInvalidDataError) {
        const errorResponse = {
          status: 400,
          message: error?.errors,
          error: 'Bad Request',
        };
        throw new BadRequestException(errorResponse);
      } else {
        throw new BadRequestException(error?.response);
      }
    }
  }
}
