import { RealizationTypeEnum, StatusEnum } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateRealizationDto {
  years: number;

  month: number;

  costCenterId: number;

  requestNumber: String;

  @Type(() => Number)
  taReff: number;

  @IsOptional()
  @IsEnum(RealizationTypeEnum)
  type: RealizationTypeEnum;

  @IsString()
  @IsNotEmpty()
  responsibleNopeg: string;

  // @IsString()
  // @IsNotEmpty()
  titleRequest: string;

  // @IsString()
  // @IsNotEmpty()
  noteRequest: string;

  statusId: number;

  @IsOptional()
  statusToId: number;

  @IsOptional()
  @IsEnum(StatusEnum)
  status: StatusEnum;

  updatedBy: string;
  roleAssignment: JSON;

  department: string;

  personalNumber: string;

  departmentTo: string;

  personalNumberTo: string;
}
