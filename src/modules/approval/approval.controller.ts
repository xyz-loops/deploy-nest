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

@Controller({
  version: '1',
  path: 'api/approval',
})
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Get('/all/:nopeg')
  findAllWithPaginationAndFilter(
    @Param('nopeg') nopeg: string,
    @Query('page') page: number,
    @Query('orderBy') orderBy: string,
    @Query() queryParams: any,
  ) {
    return this.approvalService.findAllWithPaginationAndFilter(
      page,
      orderBy,
      nopeg,
      queryParams,
    );
  }

  @Put('/:id/reject')
  async rejectRealization(
    @Param('id') id: number,
    @Body() approvalDto: ApprovalDto,
  ) {
    return this.approvalService.reject(+id, approvalDto);
  }
}
