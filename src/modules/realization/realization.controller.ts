import {
  Bind,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { RealizationService } from './realization.service';
import {
  // CreateRealization,
  CreateRealizationDto,
  CreateRealizationItemDto,
} from './dto/create-realization.dto';
import { UpdateRealizationDto } from './dto/update-realization.dto';
import {
  AnyFilesInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { extname } from 'path';
import { multerPdfOptions } from 'src/config/multer.config';
import { multerConfig } from 'src/config/multer-options.config';
import {
  CreateFileDto,
  CreateMDocCategoryDto,
} from './dto/create-file-upload.dto';
import { Request } from 'express';
import { validate, validateOrReject } from 'class-validator';
import { RealizationTypeEnum, StatusEnum } from '@prisma/client';
import { UpdateFileDto } from './dto/update-file-upload.dto';

@Controller({
  version: '1',
  path: 'api/realization',
})
export class RealizationController {
  constructor(private readonly realizationService: RealizationService) {}

  @Post(':status')
  @UseInterceptors(AnyFilesInterceptor(multerPdfOptions))
  async saveRealization(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
    @Body(new ValidationPipe()) dto: CreateRealizationDto,
    @Body() dtoFile: CreateFileDto,
    @Param('status') status: 'save' | 'submit',
  ) {
    try {
      if (!dto.realizationItems || dto.realizationItems.length === 0) {
        throw new HttpException(
          'At least one realization item must be provided',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!files || files.length === 0) {
        throw new HttpException(
          'At least one file must be uploaded',
          HttpStatus.BAD_REQUEST,
        );
      }

      const fromRequest = CreateRealizationDto.fromRequest(dto);

      const realizationItems: CreateRealizationItemDto[] =
        fromRequest.realizationItems;

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

      const realization = await this.realizationService.createRealization(
        fromRequest,
        realizationItems,
        createFileDtos,
        status,
      );

      return {
        data: realization,
        message: 'Create new request successfully created',
        status: HttpStatus.CREATED,
        time: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // @Put(':id/:status?')
  // @UseInterceptors(AnyFilesInterceptor(multerPdfOptions))
  // async updateRealization(
  //   @UploadedFiles() files: Express.Multer.File[],
  //   @Req() req: Request,
  //   @Body(new ValidationPipe()) dto: UpdateRealizationDto,
  //   @Body() dtoFile: UpdateFileDto,
  //   @Param('id') id: number,
  //   @Param('status') status?: StatusEnum,
  // ) {
  //   try {
  //     if (!dto.realizationItems || dto.realizationItems.length === 0) {
  //       throw new HttpException(
  //         'At least one realization item must be provided',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }

  //     if (!files || files.length === 0) {
  //       throw new HttpException(
  //         'At least one file must be uploaded',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }
  //     const fromRequest = UpdateRealizationDto.fromRequest(dto);

  //     const realizationItems: UpdateRealizationItemDto[] =
  //       fromRequest.realizationItems;

  //     const createFileDtos: CreateFileDto[] = (files ?? []).map(
  //       (file, index) => ({
  //         tableName: 'Realization',
  //         docName: dtoFile.docName[index],
  //         docLink: file.path,
  //         docSize: parseFloat((file.size / 1000000).toFixed(2)),
  //         docType: extname(file.originalname),
  //         createdBy: '',
  //         tableId: 1,
  //         docCategoryId: parseInt(dtoFile.docCategoryId[index]),
  //       }),
  //     );

  //     const realization = await this.realizationService.updateRealization(
  //       +id,
  //       fromRequest,
  //       realizationItems,
  //       createFileDtos,
  //       status,
  //     );

  //     return {
  //       data: realization,
  //       message: 'Create new request successfully created',
  //       status: HttpStatus.OK,
  //       time: new Date(),
  //     };
  //   } catch (error) {
  //     throw new HttpException(
  //       error.message || 'Internal Server Error',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  @Get()
  findRealization() {
    return this.realizationService.findAllRealization();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.realizationService.findOneRealization(+id);
  }

  @Get(':glAccountId/:costCenterId/calculate-total')
  async calculateTotal(
    @Param('glAccountId') glAccountId: number,
    @Param('costCenterId') costCenterId: number,
  ) {
    return this.realizationService.available(+glAccountId, +costCenterId);
  }
}
