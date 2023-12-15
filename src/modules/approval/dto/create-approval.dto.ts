import { StatusEnum } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { UpdateRealizationDto } from 'src/modules/realization/dto/update-realization.dto';

export class ApproveDto {
  readonly idRealization: number;
  readonly updateRealizationDto: UpdateRealizationDto;
  readonly approvalDto: ApprovalDto;
}

export class ApprovalDto {
  tableName: string;
  tableId: number;
  name: string;
  jabatan: string;
  unit: string;
  @IsEnum(StatusEnum)
  status: StatusEnum;
  remark?: string;
  createdBy: string;
}
