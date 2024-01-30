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

  taReff: string;

  @IsOptional()
  @IsEnum(RealizationTypeEnum)
  type: RealizationTypeEnum;

  @IsString()
  @IsNotEmpty()
  responsibleNopeg: string;

  // @IsString()
  // @IsNotEmpty()
  titleRequest: string;

  @IsString()
  @IsNotEmpty()
  noteRequest: string;

  @Type(() => Number)
  statusId: number;

  @IsOptional()
  @Type(() => Number)
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
  contributors;

  realizationItems: UpdateRealizationItemDto[];

  static fromRequest(data: UpdateRealizationDto): UpdateRealizationDto {
    data.years = Number(data.years);
    data.month = Number(data.month);
    data.statusId = Number(data.statusId);
    data.statusToId = Number(data.statusToId);

    if (Array.isArray(data.realizationItems)) {
      data.realizationItems = UpdateRealizationItemDto.fromRequestArray(
        data.realizationItems,
      );
    }

    return data;
  }
}

export class UpdateRealizationItemDto {
  @Type(() => Number)
  idRealizationItem: number;
  @Type(() => Number)
  realizationId: number;

  @Type(() => Number)
  glAccountId: number;

  @Type(() => Number)
  amount: number;

  @Type(() => Number)
  amountSubmission: number;

  @Type(() => Number)
  amountHps?: number;

  @Type(() => Number)
  amountCorrection: number;

  @Type(() => Number)
  amountApprove: number;

  periodStart: Date;

  periodFinish: Date;

  remarkPby: string;

  readonly memo?: string;

  @IsString()
  descPby: string;

  @IsString()
  createdBy: string;

  static fromRequestArray(
    data: UpdateRealizationItemDto[],
  ): UpdateRealizationItemDto[] {
    return data.map((item) => {
      item.idRealizationItem = Number(item.idRealizationItem);
      item.amount = Number(item.amount);
      item.amountSubmission = Number(item.amountSubmission);
      item.amountHps = Number(item.amountHps);
      item.amountCorrection = Number(item.amountCorrection);
      item.amountApprove = Number(item.amountApprove);
      item.glAccountId = Number(item.glAccountId);
      return item;
    });
  }
}
