import { PartialType } from '@nestjs/mapped-types';
import { CreateMGlAccountDto } from './create-m-gl-account.dto';
import { IsBoolean, IsString } from '@nestjs/class-validator';

export class UpdateMGlAccountDto extends PartialType(CreateMGlAccountDto) {
  @IsBoolean()
  sap: boolean;

  @IsBoolean()
  active: boolean;

  @IsString()
  updatedBy: string;
}
