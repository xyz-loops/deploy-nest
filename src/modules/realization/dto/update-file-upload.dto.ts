import { PartialType } from '@nestjs/mapped-types';
import { CreateFileDto } from './create-file-upload.dto';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateFileDto extends PartialType(CreateFileDto) {
  tableName: string;
  @Type(() => Number)
  tableId: number;

  @IsString()
  docName: string;

  @Type(() => Number)
  docCategoryId: number;

  docLink: string;

  docSize: number;

  docType: string;
  @IsOptional()
  // isUpdated: boolean;

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
