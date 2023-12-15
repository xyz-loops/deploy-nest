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
import { UpdateFileDto } from './update-file-upload.dto';

export class UpdateRealizationDto {
  // years: number;

  // month: number;

  // costCenterId: number;

  // requestNumber: String;

  // @Type(() => Number)
  // taReff: number;

  // @IsOptional()
  // @IsEnum(RealizationTypeEnum)
  // type: RealizationTypeEnum;

  // @IsString()
  // @IsNotEmpty()
  // responsibleNopeg: string;

  // // @IsString()
  // // @IsNotEmpty()
  // titleRequest: string;

  // // @IsString()
  // // @IsNotEmpty()
  // noteRequest: string;

  statusId: number;

  @IsOptional()
  statusToId: number;

  @IsOptional()
  @IsEnum(StatusEnum)
  status: StatusEnum;

  updatedBy: string;

  // readonly department: string;

  // readonly personalNumber: string;

  // readonly departmentTo: string;

  // readonly personalNumberTo: string;

  // @IsString()
  // @IsNotEmpty()
  // createdBy: string;

  // uploadfile: UpdateFileDto[];

  // realizationItems: UpdateRealizationItemDto[];

  // static fromRequest(data: UpdateRealizationDto): UpdateRealizationDto {
  //   data.years = Number(data.years);
  //   data.month = Number(data.month);
  //   data.requestNumber = String(data.requestNumber);
  //   data.taReff = Number(data.taReff);

  //   if (Array.isArray(data.realizationItems)) {
  //     data.realizationItems = UpdateRealizationItemDto.fromRequestArray(
  //       data.realizationItems,
  //     );
  //   }

  //   if (Array.isArray(data.uploadfile)) {
  //     data.uploadfile = UpdateFileDto.fromRequest(data.uploadfile);
  //   }

  //   return data;
  // }
}

// export class UpdateRealizationItemDto {
//   @Type(() => Number)
//   realizationId: number;

//   @Type(() => Number)
//   glAccountId: number;

//   @Type(() => Number)
//   amount: number;

//   @Type(() => Number)
//   amountSubmission: number;

//   @Type(() => Number)
//   amountHps?: number;

//   @Type(() => Number)
//   amountCorrection: number;

//   periodStart: Date;

//   periodFinish: Date;

//   remarkPby: string;

//   readonly memo?: string;

//   @IsString()
//   descPby: string;

//   @IsString()
//   createdBy: string;

//   static fromRequestArray(
//     data: UpdateRealizationItemDto[],
//   ): UpdateRealizationItemDto[] {
//     return data.map((item) => {
//       item.amount = Number(item.amount);
//       item.amountSubmission = Number(item.amountSubmission);
//       item.amountHps = Number(item.amountHps);
//       item.amountCorrection = Number(item.amountCorrection);
//       item.glAccountId = Number(item.glAccountId);
//       return item;
//     });
//   }
// }
