import { StatusEnum } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateFileDto } from 'src/modules/realization/dto/create-file-upload.dto';
import {
  UpdateRealizationDto,
  UpdateRealizationItemDto,
} from 'src/modules/realization/dto/update-realization.dto';

export class ApproveDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  idRealization: number;

  updateRealizationDto: UpdateRealizationDto;

  approvalDto: ApprovalDto;

  noteMemoDto: NoteMemoDto;

  realizationItemDto: UpdateRealizationItemDto[];

  uploadfile: CreateFileDto[];

  static fromRequest(data: ApproveDto): ApproveDto {
    data.idRealization = Number(data.idRealization);

    if (data.updateRealizationDto) {
      data.updateRealizationDto = UpdateRealizationDto.fromRequest(
        data.updateRealizationDto,
      );
    }

    if (Array.isArray(data.realizationItemDto)) {
      data.realizationItemDto = UpdateRealizationItemDto.fromRequestArray(
        data.realizationItemDto,
      );
    }

    if (Array.isArray(data.uploadfile)) {
      data.uploadfile = CreateFileDto.fromRequest(data.uploadfile);
    }

    return data;
  }
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
  @Type(() => Number)
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

  static fromRequest(data: NoteMemoDto): NoteMemoDto {
    data.approvalId = Number(data.approvalId);
    return data;
  }
}
