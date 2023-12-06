//file: your-module-process-excel-to-json-builder.util.ts--------------------------------------------------------
import { Cell, CellValue, Row, Workbook, Worksheet } from 'exceljs';
import { ColumnDto } from 'src/modules/budget-upload/dto/budget-upload-sheets.dto';
import { MessagesInvalidDataError } from '../errors/invalid-data.error';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ReadBudgetUploadSheetDto } from 'src/modules/budget-upload/dto/read-budget-upload.dto';
import { BudgetUploadSheetsDto } from 'src/modules/budget-upload/dto/budget-upload-sheets.dto';
import { Observable, lastValueFrom, mergeMap, of } from 'rxjs';

@Injectable()
export class BudgetUploadProcessExcelToJsonBuilder {
  private filePath: string;
  private sheets: BudgetUploadSheetsDto[];
  private errorSheetName: string[] = [];
  private errorMessages: { [key: string]: string }[] = [];

  constructor() {
    BudgetUploadProcessExcelToJsonBuilder?.name;
  }

  getFile(filePath: string): this {
    this.filePath = filePath;
    this.sheets = [];
    this.errorSheetName = [];
    this.errorMessages = [];
    return this;
  }

  addSheet(sheet: BudgetUploadSheetsDto): this {
    this.sheets.push(sheet);
    return this;
  }

  static validateCellData(
    cellValue: CellValue,
    dataType: string,
    maxLength?: number,
  ): boolean {
    if (dataType === 'string' && typeof cellValue !== 'string') return false;
    if (
      dataType === 'number' &&
      (typeof cellValue !== 'number' || isNaN(cellValue))
    )
      return false;
    if (maxLength && cellValue.toLocaleString().length > maxLength)
      return false;
    return true;
  }

  processCell(
    cell: Cell,
    cellIndex: number,
    rowData: Record<string, CellValue>,
    sheetConfig: BudgetUploadSheetsDto,
  ): this {
    const columnName: string =
      //CHARCODE -1 = A
      sheetConfig.columnToKey[String.fromCharCode(64 + cellIndex)];
    if (!columnName) return;

    const columnConfig: ColumnDto = sheetConfig.columns[columnName];
    if (!columnConfig) return;

    const { dataType, maxLength }: ColumnDto = columnConfig;
    const cellValue: CellValue =
      cell?.value['result'] || cell?.value['error'] || cell?.value;

    // console.log(`column-name : ${columnName}`);
    // console.log(`value : ${cellValue}`);
    // console.log(`type: ${typeof cellValue}`);
    // console.log('______________________________ ');

    if (Object(cellValue).toString().startsWith('Invalid')) {
      this.errorSheetName.push(sheetConfig.name);
      this.errorMessages.push({
        [`column[${String.fromCharCode(64 + cellIndex)}]`]:
          `${columnName} cell format categories must be general* on row ${cell.row}`,
      });
      return this;
    }

    if (
      !BudgetUploadProcessExcelToJsonBuilder.validateCellData(
        cellValue,
        dataType,
        maxLength,
      )
    ) {
      this.errorSheetName.push(sheetConfig.name);
      this.errorMessages.push({
        [`column[${String.fromCharCode(64 + cellIndex)}]`]:
          `${columnName} must be of type ${
            dataType === 'Object' ? 'string' : dataType
          }* or length limit is ${maxLength}* on row ${cell.row}`,
      });
      return this;
    }

    rowData[columnName] = cellValue;
    return this;
  }

  readSheetData<T>(
    worksheet: Worksheet,
    headerRows: number,
    sheetConfig: BudgetUploadSheetsDto,
    processCellFn: (
      cell: Cell,
      cellIndex: number,
      rowData: Record<string, CellValue>,
      sheetConfig: BudgetUploadSheetsDto,
    ) => this,
  ): T[] {
    const rows: T[] = [];

    worksheet.eachRow((row: Row, rowIndex: number): void => {
      if (rowIndex > headerRows) {
        const rowData: Record<string, CellValue> = {};
        row.eachCell((cell: Cell, cellIndex: number): void => {
          processCellFn(cell, cellIndex, rowData, sheetConfig);
        });
        rows.push(rowData as T);
      }
    });

    return rows;
  }

  textToCamelCase(text: string): string {
    const words: string[] = text.split(' ');
    const camelCaseWords: string[] = [words[0].toLowerCase()];

    for (let i = 1; i < words.length; i++) {
      camelCaseWords.push(
        words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase(),
      );
    }

    return camelCaseWords.join('');
  }

  async build<T>(req: Request): Promise<ReadBudgetUploadSheetDto> {
    const years: number = req?.body['years'];
    const workbook: Workbook = new Workbook();
    await workbook.xlsx.readFile(String(this.filePath));
    // console.log(this.filePath);
    // console.log(this.sheets);
    // console.log(years);

    const data: ReadBudgetUploadSheetDto = {
      budgetUpload: null,
    };

    //console log in satu satu mulai dari isi rows, dll.
    const $dataSheets: Observable<BudgetUploadSheetsDto> = of(this.sheets).pipe(
      mergeMap((items) => items),
      mergeMap((sheet) => {
        const { name, header } = sheet;
        const worksheet: Worksheet = workbook.getWorksheet(name);
        // console.log(sheet);
        if (worksheet) {
          const rows = this.readSheetData(
            worksheet,
            header.rows,
            sheet,
            this.processCell.bind(this),
          );
          data[this.textToCamelCase(name)] = rows;
        }
        return of(sheet);
      }),
    );
    await lastValueFrom($dataSheets);
    if (this.errorSheetName.length > 0 && this.errorMessages.length > 0) {
      const uniqueSheetNames: string[] = [...new Set(this.errorSheetName)];
      const errors = uniqueSheetNames.map((sheetName) => {
        const sheetErrorMessages: { [key: string]: string }[] =
          this.errorMessages
            .map((msg, index) =>
              this.errorSheetName[index] === sheetName ? msg : null,
            )
            .filter(Boolean);
        return { sheetName, invalidColumn: sheetErrorMessages };
      });

      throw new MessagesInvalidDataError(errors);
    }
    data.budgetUpload = data['td2023'];
    // console.log(data);
    return data;
  }
}
//file: read-excel-sheet-your-module-builder.util.ts--------------------------------------------------------
