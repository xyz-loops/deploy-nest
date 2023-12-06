import { PartialType } from '@nestjs/mapped-types';
import { CreateKursDto } from './create-kurs.dto';
import { IsString, IsNotEmpty } from '@nestjs/class-validator';

export class UpdateKursDto extends PartialType(CreateKursDto) {
  @IsNotEmpty()
  @IsString()
  updatedBy: string;
}
