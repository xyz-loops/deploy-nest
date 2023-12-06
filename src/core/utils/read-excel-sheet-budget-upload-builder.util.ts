//file: read-excel-sheet-your-module-builder.util.ts--------------------------------------------------------
import { camelCase } from 'lodash';
import {
  BudgetUploadSheetsDto,
  HeaderDto,
} from 'src/modules/budget-upload/dto/budget-upload-sheets.dto';
import { Injectable } from '@nestjs/common';
import { StringNumberBigintObject } from '../types/string-number-bigint-object.types';

@Injectable()
export class ReadExcelSheetBudgetUploadBuilder {
  private sheet: BudgetUploadSheetsDto;

  getSheetName(name: string): this {
    this.sheet = new BudgetUploadSheetsDto();
    this.sheet.name = name;
    // console.log(this.sheet.name);
    return this;
  }

  //Mulai baris berapa
  ignoreHeaderRow(rows: number = 1): this {
    const header = new HeaderDto();
    header.rows = rows;
    this.sheet.header = header;
    return this;
  }

  setSheetNameToJsonFields(columns: string[]): this {
    const columnToKey: Record<string, string> = {};
    columns.forEach((col, index): void => {
      //dganti 66 = b code CHARCODE
      //Mulai column index berapa
      columnToKey[String.fromCharCode(65 + index)] = camelCase(col);
    });

    this.sheet.columnToKey = columnToKey;
    return this;
  }

  setColumnPropertyToJsonFields(columns: {
    [key: string]: { dataType: StringNumberBigintObject; maxLength?: number };
  }): this {
    this.sheet.columns = columns;
    return this;
  }

  build(): BudgetUploadSheetsDto {
    return this.sheet;
  }
}
