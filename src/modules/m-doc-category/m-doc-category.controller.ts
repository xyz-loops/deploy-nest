import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CreateMDocCategoryDto } from './dto/create-m-doc-category.dto';
import { UpdateMDocCategoryDto } from './dto/update-m-doc-category.dto';
import { MDocCategoryService } from './m-doc-category.service';

@Controller({
  version: '1',
  path: 'api/upload',
})
export class MDocCategoryController {
  constructor(private readonly mDocCategoryService: MDocCategoryService) {}

  @Post('/category')
  createdoc(@Body() CreateMDocCategoryDto: CreateMDocCategoryDto) {
    return this.mDocCategoryService.create(CreateMDocCategoryDto);
  }

  @Get('/category')
  findAllDoc() {
    return this.mDocCategoryService.findAll();
  }

  @Put('/category/:id')
  update(
    @Param('id') id: number,
    @Body() UpdateMDocCategoryDto: UpdateMDocCategoryDto,
  ) {
    return this.mDocCategoryService.update(+id, UpdateMDocCategoryDto);
  }

  @Delete('/category/:id')
  removeDoc(@Param('id') id: number) {
    return this.mDocCategoryService.remove(+id);
  }
}
