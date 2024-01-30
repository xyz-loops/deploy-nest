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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApprovalService } from './approval.service';
import { ApprovalDto, ApproveDto } from './dto/create-approval.dto';
import { UpdateApprovalDto } from './dto/update-approval.dto';
import { UpdateRealizationDto } from '../realization/dto/update-realization.dto';
import { extname } from 'path';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { multerPdfOptions } from 'src/config/multer.config';
import { CreateFileDto } from '../realization/dto/create-file-upload.dto';

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
    @Query('isTAP', ParseBoolPipe) isTAP: boolean,
  ) {
    return this.approvalService.findAllWithPaginationAndFilter(
      page,
      orderBy,
      personalNumberTo,
      queryParams,
      isTAB,
      isTXC3,
      isTAP,
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
  @UseInterceptors(AnyFilesInterceptor(multerPdfOptions))
  async approval(
    @Body() dto: ApproveDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dtoFile: CreateFileDto,
  ) {
    const fromRequest = ApproveDto.fromRequest(dto);

    const createFileDtos: CreateFileDto[] = (files ?? []).map(
      (file, index) => ({
        tableName: 'Realization',
        docName: dtoFile.docName[index],
        docLink: file.path,
        docSize: parseFloat((file.size / 1000000).toFixed(2)),
        docType: extname(file.originalname),
        department: '',
        createdBy: '',
        tableId: 1,
        docCategoryId: parseInt(dtoFile.docCategoryId[index]),
      }),
    );

    return this.approvalService.approval(fromRequest, createFileDtos);
  }

  @Put('/take/:id')
  async takeProject(
    @Param('id') id: number,
    @Body() updateRealizationDto: UpdateRealizationDto,
    @Query('isTAB', ParseBoolPipe) isTAB: boolean,
    @Query('isTXC-3', ParseBoolPipe) isTXC3: boolean,
    @Query('isTAP', ParseBoolPipe) isTAP: boolean,
  ) {
    return this.approvalService.take(
      +id,
      updateRealizationDto,
      isTAB,
      isTXC3,
      isTAP,
    );
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
