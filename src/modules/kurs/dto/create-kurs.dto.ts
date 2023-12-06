import { IsNotEmpty, IsNumber, IsString } from '@nestjs/class-validator';

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
