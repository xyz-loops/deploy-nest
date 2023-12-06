import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMStatusDto {
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsNotEmpty()
  @IsNumber()
  step: number;

  @IsOptional()
  @IsString()
  department: string;

  @IsNotEmpty()
  @IsNumber()
  level: number;

  @IsOptional()
  @IsString()
  function: string;

  @IsNotEmpty()
  @IsString()
  createdBy: string;
}
