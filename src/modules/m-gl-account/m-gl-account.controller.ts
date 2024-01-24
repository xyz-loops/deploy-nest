import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { MGlAccountService } from './m-gl-account.service';
import { CreateMGlAccountDto } from './dto/create-m-gl-account.dto';
import { UpdateMGlAccountDto } from './dto/update-m-gl-account.dto';

@Controller({
  version: '1',
  path: 'api/m-gl-account',
})
export class MGlAccountController {
  constructor(private readonly mGlAccountService: MGlAccountService) {}

  @Post()
  create(@Body() createMGlAccountDto: CreateMGlAccountDto) {
    return this.mGlAccountService.create(createMGlAccountDto);
  }

  @Get('/all')
  findAll() {
    return this.mGlAccountService.findAll();
  }

  @Get('/find/:id')
  findOne(@Param('id') id: number) {
    return this.mGlAccountService.findOne(+id);
  }

  @Get('all/group/')
  findGroup() {
    return this.mGlAccountService.groupingByGroup();
  }

  @Get('all/group/:groupGl')
  findByBidang(@Param('groupGl') groupGl: string) {
    return this.mGlAccountService.findGroup(groupGl);
  }

  @Get('/pagination/')
  findAllPaginated(
    @Query('page') page: number,
    @Query('orderBy') orderBy: string,
    @Query() queryParams: any
  ) {
    return this.mGlAccountService.findAllPaginated(page, orderBy, queryParams);
  }

  @Put('/update/:id')
  update(
    @Param('id') id: number,
    @Body() updateMGlAccountDto: UpdateMGlAccountDto,
  ) {
    return this.mGlAccountService.update(+id, updateMGlAccountDto);
  }

  @Delete('/delete/:id')
  remove(@Param('id') id: number) {
    return this.mGlAccountService.remove(+id);
  }
}
