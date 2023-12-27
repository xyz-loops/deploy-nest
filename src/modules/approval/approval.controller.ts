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
  ) {
    return this.approvalService.findAllWithPaginationAndFilter(
      page,
      orderBy,
      personalNumberTo,
      queryParams,
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
