import { PartialType } from '@nestjs/mapped-types';
import { CreateMStatusDto } from './create-m-status.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateMStatusDto extends PartialType(CreateMStatusDto) {
  @IsNotEmpty()
  @IsString()
  updatedBy: string;
}
