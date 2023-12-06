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
import { CreateFileDto } from 'src/modules/realization/dto/create-file-upload.dto';

export class CreateRealizationDto {
  years: number;

  month: number;

  @Type(() => Number)
  costCenterId: number;

  requestNumber: number;
  draftNumber: number;

  @Type(() => Number)
  taReff: number;

  @IsOptional()
  @IsEnum(RealizationTypeEnum)
  type: RealizationTypeEnum;

  // @IsString()
  // @IsNotEmpty()
  responsibleNopeg: string;

  // @IsString()
  // @IsNotEmpty()
  titleRequest: string;

  // @IsString()
  // @IsNotEmpty()
  noteRequest: string;

  statusId: number;

  statusToId: number;

  readonly department: string;

  readonly personalNumber: string;

  readonly departmentTo: string;

  readonly personalNumberTo: string;

  // @IsString()
  // @IsNotEmpty()
  createdBy: string;

  uploadfile: CreateFileDto[];

  realizationItems: CreateRealizationItemDto[];

  static fromRequest(data: CreateRealizationDto): CreateRealizationDto {
    data.years = Number(data.years);
    data.month = Number(data.month);
    data.costCenterId = Number(data.costCenterId);
    data.taReff = Number(data.taReff);

    if (Array.isArray(data.realizationItems)) {
      data.realizationItems = CreateRealizationItemDto.fromRequestArray(
        data.realizationItems,
      );
    }

    if (Array.isArray(data.uploadfile)) {
      data.uploadfile = CreateFileDto.fromRequest(data.uploadfile);
    }

    return data;
  }
}

export class CreateRealizationItemDto {
  @IsNotEmpty()
  @Type(() => Number)
  glAccountId: number;

  @Type(() => Number)
  amount: number;

  @IsNotEmpty()
  @Type(() => Number)
  amountSubmission: number;

  @Type(() => Number)
  amountHps?: number;

  @Type(() => Number)
  amountCorrection: number;

  @IsNotEmpty()
  periodStart: Date;

  @IsNotEmpty()
  periodFinish: Date;

  @IsNotEmpty()
  @IsString()
  remarkPby: string;

  readonly memo?: string;

  @IsNotEmpty()
  @IsString()
  descPby: string;

  @IsNotEmpty()
  @IsString()
  createdBy: string;

  static fromRequestArray(
    data: CreateRealizationItemDto[],
  ): CreateRealizationItemDto[] {
    return data.map((item) => {
      item.amount = Number(item.amount);
      item.amountSubmission = Number(item.amountSubmission);
      item.amountHps = Number(item.amountHps);
      item.amountCorrection = Number(item.amountCorrection);
      item.glAccountId = Number(item.glAccountId);
      return item;
    });
  }
}
