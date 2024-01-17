import { StatusEnum } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { UpdateRealizationDto, UpdateRealizationItemDto } from 'src/modules/realization/dto/update-realization.dto';

export class ApproveDto {
  @IsNotEmpty()
  @IsNumber()
  readonly idRealization: number;

  readonly updateRealizationDto: UpdateRealizationDto;

  readonly approvalDto: ApprovalDto;

  readonly noteMemoDto: NoteMemoDto;

  readonly realizationItemDto: UpdateRealizationItemDto[];
}

export class ApprovalDto {
  tableName: string;
  tableId: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  jabatan: string;

  @IsNotEmpty()
  @IsString()
  unit: string;

  @IsNotEmpty()
  @IsEnum(StatusEnum)
  status: StatusEnum;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsNotEmpty()
  @IsString()
  createdBy: string;
}

export class NoteMemoDto {
  @IsNumber()
  approvalId: number;

  @IsNumber()
  years: number;

  @IsNotEmpty()
  @IsString()
  dinas: string;

  @IsString()
  memoNumber: string;

  @IsNotEmpty()
  @IsString()
  note: string;

  @IsNotEmpty()
  @IsString()
  departmentTo: string;

  @IsNotEmpty()
  @IsString()
  createdBy: string;
}