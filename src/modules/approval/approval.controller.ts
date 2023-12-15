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
import { ApprovalDto } from './dto/create-approval.dto';
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

  @Put('/:id/reject')
  async rejectRealization(
    @Param('id') id: number,
    @Body() approvalDto: ApprovalDto,
    @Body() updateRealizationDto: UpdateRealizationDto,
  ) {
    return this.approvalService.reject(+id, updateRealizationDto, approvalDto);
  }
}
