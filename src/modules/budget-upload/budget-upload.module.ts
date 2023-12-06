import { Module } from '@nestjs/common';
import { BudgetUploadController } from './budget-upload.controller';
import { BudgetUploadService } from './budget-upload.service';
import { ExcelBudgetUploadService } from './excel-budget-upload.service';
import { ReadExcelSheetBudgetUploadBuilder } from 'src/core/utils/read-excel-sheet-budget-upload-builder.util';
import { BudgetUploadProcessExcelToJsonBuilder } from 'src/core/utils/budget-upload-process-excel-to-json-builder.util';
import { PrismaService } from 'src/core/service/prisma/prisma.service';
import { BudgetService } from './budget.service';

@Module({
  controllers: [BudgetUploadController],
  providers: [
    BudgetUploadService,
    ExcelBudgetUploadService,
    ReadExcelSheetBudgetUploadBuilder,
    BudgetService,
    BudgetUploadProcessExcelToJsonBuilder,
    PrismaService,
  ],
})
export class BudgetUploadModule {}
