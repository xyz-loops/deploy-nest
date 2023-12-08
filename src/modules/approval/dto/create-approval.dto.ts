import { StatusEnum } from '@prisma/client';
import { IsEnum } from 'class-validator';

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
