import { ModulEnum } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFileDto {
  tableName: string;
  @Type(() => Number)
  tableId: number;

  @IsNotEmpty()
  docName: string;

  @IsNotEmpty()
  @Type(() => Number)
  docCategoryId: number;
  //draftNumber: number;

  docLink: string;

  docSize: number;

  docType: string;
  department: string;

  //files?: any;

  //@IsNotEmpty()
  // @IsString()
  createdBy: string;

  static fromRequest(data: CreateFileDto[]): CreateFileDto[] {
    return data.map((file) => {
      file.docCategoryId = Number(file.docCategoryId);
      file.tableId = Number(file.tableId);
      return file;
    });
  }
}

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
