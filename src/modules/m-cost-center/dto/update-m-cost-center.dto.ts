import { PartialType } from '@nestjs/mapped-types';
import { CreateMCostCenterDto } from './create-m-cost-center.dto';
import { IsString, IsNotEmpty } from '@nestjs/class-validator';

export class UpdateMCostCenterDto extends PartialType(CreateMCostCenterDto) {
  @IsNotEmpty()
  @IsString()
  updatedBy: string;
}
