import { PartialType } from '@nestjs/mapped-types';
import { CreateMDocCategoryDto } from './create-m-doc-category.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateMDocCategoryDto extends PartialType(CreateMDocCategoryDto) {
  @IsNotEmpty()
  @IsString()
  updatedBy: string;
}
