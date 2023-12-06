import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDecimal,
} from '@nestjs/class-validator';

export class CreateKursDto {
  @IsNotEmpty()
  @IsNumber()
  years: number;

  @IsNotEmpty()
  @IsNumber()
  value: number;

  @IsNotEmpty()
  @IsString()
  createdBy: string;
}
