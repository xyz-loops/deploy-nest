import { Module } from '@nestjs/common';
import { BudgetUploadService } from './budget-upload.service';
import { BudgetUploadController } from './budget-upload.controller';
import { ExcelBudgetUploadService } from './excel-budget-upload.service';
import { ReadExcelSheetBudgetUploadBuilder } from 'src/core/utils/read-excel-sheet-budget-upload-builder.util';
import { BudgetUploadProcessExcelToJsonBuilder } from 'src/core/utils/budget-upload-process-excel-to-json-builder.util';
import { PrismaService } from 'src/core/service/prisma.service';

@Module({
  controllers: [BudgetUploadController],
  providers: [
    BudgetUploadService,
    ExcelBudgetUploadService,
    ReadExcelSheetBudgetUploadBuilder,
    BudgetUploadProcessExcelToJsonBuilder,
    PrismaService,
  ],
})
export class BudgetUploadModule {}
