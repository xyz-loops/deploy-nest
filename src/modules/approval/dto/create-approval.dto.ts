import { StatusEnum } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { UpdateRealizationDto } from 'src/modules/realization/dto/update-realization.dto';

export class ApproveDto {
  @IsNotEmpty()
  @IsNumber()
  readonly idRealization: number;

  readonly updateRealizationDto: UpdateRealizationDto;

  readonly approvalDto: ApprovalDto;
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
