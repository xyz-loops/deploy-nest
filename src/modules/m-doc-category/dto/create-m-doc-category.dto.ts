import { ModulEnum } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMDocCategoryDto {
  @IsOptional()
  @IsEnum(ModulEnum)
  module: ModulEnum;

  @IsNotEmpty()
  @IsString()
  docCategory: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  createdBy: string;
}
