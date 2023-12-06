import { Type } from 'class-transformer';
import {
  IsNumber,
  IsNotEmpty,
  IsDate,
  IsString,
  IsOptional,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { StringNumberBigintObject } from 'src/core/types/string-number-bigint-object.types';

export class ItemsBudgetUploadDto {
  @IsNotEmpty()
  @IsNumber()
  years: number;

  @IsNotEmpty()
  @IsInt()
  costCenterId: number;

  @IsNotEmpty()
  @IsInt()
  glAccountId: number;

  @IsOptional()
  @IsNumber()
  value1: number;

  @IsOptional()
  @IsNumber()
  value2: number;

  @IsOptional()
  @IsNumber()
  value3: number;

  @IsOptional()
  @IsNumber()
  value4: number;

  @IsOptional()
  @IsNumber()
  value5: number;

  @IsOptional()
  @IsNumber()
  value6: number;

  @IsOptional()
  @IsNumber()
  value7: number;

  @IsOptional()
  @IsNumber()
  value8: number;

  @IsOptional()
  @IsNumber()
  value9: number;

  @IsOptional()
  @IsNumber()
  value10: number;

  @IsOptional()
  @IsNumber()
  value11: number;

  @IsOptional()
  @IsNumber()
  value12: number;

  @IsOptional()
  @IsNumber()
  value13: number;

  @IsOptional()
  @IsNumber()
  value14: number;

  @IsOptional()
  @IsNumber()
  value15: number;

  @IsOptional()
  @IsNumber()
  value16: number;

  @IsOptional()
  @IsNumber()
  total: number;

  @IsNotEmpty()
  @IsString()
  createdBy: string;

  static propertyConfig: Partial<
    Record<
      keyof ItemsBudgetUploadDto,
      { dataType: StringNumberBigintObject; maxLength?: number }
    >
  > = {
    years: { dataType: 'number', maxLength: 300 },
    costCenterId: { dataType: 'string', maxLength: 300 },
    glAccountId: { dataType: 'number', maxLength: 300 },
    value1: { dataType: 'decimal', maxLength: 300 },
    value2: { dataType: 'decimal', maxLength: 300 },
    value3: { dataType: 'decimal', maxLength: 300 },
    value4: { dataType: 'decimal', maxLength: 300 },
    value5: { dataType: 'decimal', maxLength: 300 },
    value6: { dataType: 'decimal', maxLength: 300 },
    value7: { dataType: 'decimal', maxLength: 300 },
    value8: { dataType: 'decimal', maxLength: 300 },
    value9: { dataType: 'decimal', maxLength: 300 },
    value10: { dataType: 'decimal', maxLength: 300 },
    value11: { dataType: 'decimal', maxLength: 300 },
    value12: { dataType: 'decimal', maxLength: 300 },
    value13: { dataType: 'decimal', maxLength: 300 },
    value14: { dataType: 'decimal', maxLength: 300 },
    value15: { dataType: 'decimal', maxLength: 300 },
    value16: { dataType: 'decimal', maxLength: 300 },
  };

  static propertyNames: (keyof ItemsBudgetUploadDto)[] = [
    'years',
    'costCenterId',
    'glAccountId',
    'value1',
    'value2',
    'value3',
    'value4',
    'value5',
    'value6',
    'value7',
    'value8',
    'value9',
    'value10',
    'value11',
    'value12',
    'value13',
    'value14',
    'value15',
    'value16',
  ];
}
