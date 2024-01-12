import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { ApprovalService } from './approval.service';
import { ApprovalDto, ApproveDto } from './dto/create-approval.dto';
import { UpdateApprovalDto } from './dto/update-approval.dto';
import { UpdateRealizationDto } from '../realization/dto/update-realization.dto';

@Controller({
  version: '1',
  path: 'api/approval',
})
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Get('/all/:personalNumberTo')
  findAllWithPaginationAndFilter(
    @Param('personalNumberTo') personalNumberTo: string,
    @Query('page') page: number,
    @Query('orderBy') orderBy: string,
    @Query() queryParams: any,
    @Query('isTAB', ParseBoolPipe) isTAB: boolean,
    @Query('isTXC-3', ParseBoolPipe) isTXC3: boolean,
  ) {
    return this.approvalService.findAllWithPaginationAndFilter(
      page,
      orderBy,
      personalNumberTo,
      queryParams,
      isTAB,
      isTXC3,
    );
  }

  @Get('count/:personalNumberTo')
  countNeedApproval(@Param('personalNumberTo') personalNumberTo: string) {
    return this.approvalService.countNeedApproval(personalNumberTo);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.approvalService.findOneApproval(+id);
  }

  @Post('/approve')
  async approval(@Body() dto: ApproveDto) {
    return this.approvalService.approval(dto);
  }

  @Put('/take/:id')
  async takeProject(
    @Param('id') id: number,
    @Body() updateRealizationDto: UpdateRealizationDto,
    @Query('isTAB', ParseBoolPipe) isTAB: boolean,
    @Query('isTXC-3', ParseBoolPipe) isTXC3: boolean,
  ) {
    return this.approvalService.take(+id, updateRealizationDto, isTAB, isTXC3);
  }

  @Get('remark/:id')
  remark(
    @Param('id') id: number,
    @Query('page') page: number,
    @Query('orderBy') orderBy: string,
    @Query() queryParams: any,
  ) {
    return this.approvalService.remark(+id, page, orderBy, queryParams);
  }
}
