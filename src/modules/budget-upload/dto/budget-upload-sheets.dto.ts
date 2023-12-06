import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';
import { StringNumberBigintObject } from 'src/core/types/string-number-bigint-object.types';

export class BudgetUploadSheetsDto {
  @IsString()
  name: string;

  @IsObject()
  @ValidateNested()
  @Type(() => HeaderDto)
  header: {
    rows: number;
  };

  @IsObject()
  columnToKey: { [key: string]: string };

  @IsObject()
  @ValidateNested()
  @Type(() => ColumnDto)
  columns: { [key: string]: ColumnDto };
}

export class HeaderDto {
  @IsNumber()
  rows: number;
}

export class ColumnDto {
  dataType: StringNumberBigintObject;
  maxLength?: number;
}
