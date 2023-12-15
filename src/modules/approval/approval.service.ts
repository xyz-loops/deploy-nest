import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApprovalDto, ApproveDto } from './dto/create-approval.dto';
import { UpdateApprovalDto } from './dto/update-approval.dto';
import { PrismaService } from 'src/core/service/prisma.service';
import { StatusEnum } from '@prisma/client';
import { UpdateRealizationDto } from '../realization/dto/update-realization.dto';
import { SortOrder } from '@elastic/elasticsearch/lib/api/types';
import { status } from 'prisma/dummy-data';

@Injectable()
export class ApprovalService {
  constructor(private readonly prisma: PrismaService) {}

  async countNeedApproval(personalNumberTo: string) {
    try {
      const totalItems = await this.prisma.realization.count({
        where: {
          personalNumberTo: personalNumberTo,
        },
      });

      return {
        data: totalItems,
        meta: { personalNumberTo: personalNumberTo },
        message: 'Total items needing approval retrieved',
        status: HttpStatus.OK,
        time: new Date(),
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Failed to retrieve total items needing approval',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          time: new Date(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllWithPaginationAndFilter(
    page: number,
    order: string = 'asc',
    personalNumberTo: string,
    queryParams: any,
  ) {
    try {
      const perPage = 10;

      if (!['asc', 'desc'].includes(order.toLowerCase())) {
        throw new BadRequestException(
          'Invalid order parameter. Use "asc" or "desc".',
        );
      }

      // Filter logic
      const {
        taReff,
        requestNumber,
        dinas,
        typeOfLetter,
        status,
        statusTo,
        entryDate,
        entryDateTo,
      } = queryParams;
      let filter: any = {};
      if (taReff) {
        filter.taReff = taReff; // konversi ke number jika diperlukan
      }
      if (requestNumber) {
        filter.requestNumber = requestNumber; // konversi ke number jika diperlukan
      }
      if (dinas) {
        filter.departmentTo = { startsWith: dinas };
      }
      if (typeOfLetter) {
        filter.typeOfLetter = typeOfLetter; // konversi ke number jika diperlukan
      }
      if (status) {
        filter.status = status;
      }
      if (statusTo) {
        filter.personalNumberTo = statusTo;
      }

      if (entryDate && entryDateTo) {
        const formattedEntryDate = new Date(entryDate)
          .toISOString()
          .split('T')[0];
        const formattedEntryDateTo = new Date(entryDateTo)
          .toISOString()
          .split('T')[0];
        filter.createdAt = {
          gte: new Date(formattedEntryDate), // gte: greater than or equal
          lte: new Date(formattedEntryDateTo + 'T23:59:59.999Z'), // lte: less than or equal
        };
      }

      // Count total items with applied filters
      const totalItems = await this.prisma.realization.count({
        where: {
          ...filter,
          personalNumberTo: personalNumberTo,
        },
      });

      const skip = (page - 1) * perPage;

      // Determine the last available page
      const lastPage = Math.ceil(totalItems / perPage);

      // Check if the requested page exceeds the last available page
      if (page > lastPage) {
        return {
          data: [],
          meta: {
            currentPage: Number(page),
            totalItems,
            lastpage: lastPage,
            totalItemsPerPage: 0, // Set to 0 when the requested page exceeds the last available page
          },
          message: 'Pagination dashboard retrieved',
          status: HttpStatus.OK,
          time: new Date(),
        };
      }

      const realization = await this.prisma.realization.findMany({
        skip,
        take: perPage,
        orderBy: {
          createdAt: order.toLowerCase() as SortOrder,
        },
        where: {
          ...filter,
          personalNumberTo: personalNumberTo,
        },
        include: {
          realizationItem: true,
        },
      });

      // const remainingItems = totalItems % perPage;
      const remainingItems = totalItems - skip;
      const isLastPage = page * perPage >= totalItems;

      const realizationWithFileUpload = realization.map((realizationItem) => {
        const totalAmount = realizationItem.realizationItem.reduce(
          (accumulator, currentItem) => accumulator + (currentItem.amount || 0),
          0,
        );

        return {
          idRealization: realizationItem.idRealization,
          taReff: realizationItem.taReff,
          requestNumber: realizationItem.requestNumber,
          typeOfLetter: realizationItem.typeOfLetter,
          entryDate: realizationItem.createdAt,
          amountSubmission: totalAmount,
          status: realizationItem.status,
          statusTo: realizationItem.personalNumberTo,
          departmentTo: realizationItem.departmentTo,
          description: realizationItem.titleRequest,
        };
      });

      const totalItemsPerPage = isLastPage ? remainingItems : perPage;

      return {
        data: realizationWithFileUpload,
        meta: {
          currentPage: Number(page),
          totalItems,
          lastpage: Math.ceil(totalItems / perPage),
          totalItemsPerPage: Number(totalItemsPerPage),
        },
        message: 'Pagination need approval retrieved',
        status: HttpStatus.OK,
        time: new Date(),
      };
    } catch (error) {
      // Handle errors
      if (error instanceof BadRequestException) {
        throw new BadRequestException(
          'Invalid filter parameters. ' + error.message,
        );
      } else {
        throw new InternalServerErrorException(
          'Internal Server Error: ' + error.message,
        );
      }
    }
  }

  async findOneApproval(id: number) {
    const realization = await this.prisma.realization.findUnique({
      where: {
        idRealization: id,
      },
      include: {
        realizationItem: true,
      },
    });

    if (!realization) {
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Realization not found',
          status: HttpStatus.NOT_FOUND,
          time: new Date(),
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const fileUpload = await this.prisma.fileUpload.findMany({
      where: {
        tableName: 'Realization',
      },
    });

    const correspondingFileUploads = fileUpload.filter(
      (fileUpload) => fileUpload.tableId === realization.idRealization,
    );

    const realizationWithFileUpload = {
      realization: {
        ...realization,
        fileUploads: correspondingFileUploads || [], // Array of file uploads or an empty array
      },
      meta: null,
      message: 'Realization found',
      status: HttpStatus.OK,
      time: new Date(),
    };

    return realizationWithFileUpload;
  }

  async approval(dto: ApproveDto) {
    const { idRealization, updateRealizationDto, approvalDto } = dto;
    const realization = await this.prisma.realization.findUnique({
      where: { idRealization: idRealization },
    });

    try {
      let personalNumberTo: string | null = null;

      if (updateRealizationDto.statusToId === null) {
        personalNumberTo = null;
      } else if (updateRealizationDto.statusToId === 2) {
        personalNumberTo = 'string';
      }

      const updatedRealization = await this.prisma.realization.update({
        where: { idRealization: idRealization },
        data: {
          status: updateRealizationDto.status,
          statusId: updateRealizationDto.statusId,
          statusToId: updateRealizationDto.statusToId,
          personalNumberTo: personalNumberTo,
          updatedBy: updateRealizationDto.updatedBy,
        },
      });

      const createdApproval = await this.prisma.approval.create({
        data: {
          ...approvalDto,
          tableName: 'Realization',
          tableId: idRealization,
          status: updateRealizationDto.status,
          createdBy: updateRealizationDto.updatedBy,
        },
      });

      return {
        data: { updatedRealization, createdApproval },
        meta: null,
        message: 'Realization updated, and Approval created successfully',
        status: HttpStatus.OK,
        time: new Date(),
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Failed to update Realization and insert Approval',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          time: new Date(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remark(
    page: number,
    order: string = 'asc',
    personalNumberTo: string,
    queryParams: any,
  ) {
    try {
      const perPage = 10;

      if (!['asc', 'desc'].includes(order.toLowerCase())) {
        throw new BadRequestException(
          'Invalid order parameter. Use "asc" or "desc".',
        );
      }

      // Filter logic
      const { status, statusTo, dateOfRemarkFrom, dateOfRemarkTo } =
        queryParams;
      let filter: any = {};

      if (status) {
        filter.status = status;
      }
      if (statusTo) {
        filter.unit = statusTo; // Assuming `statusTo` corresponds to `unit` in the `Approval` model
      }

      if (dateOfRemarkFrom && dateOfRemarkTo) {
        const formattedDateOfRemarkFrom = new Date(dateOfRemarkFrom)
          .toISOString()
          .split('T')[0];
        const formattedDateOfRemarkTo = new Date(dateOfRemarkTo)
          .toISOString()
          .split('T')[0];
        filter.createdAt = {
          gte: new Date(formattedDateOfRemarkFrom),
          lte: new Date(formattedDateOfRemarkTo + 'T23:59:59.999Z'),
        };
      }

      // Count total items with applied filters
      const totalItems = await this.prisma.approval.count({
        where: {
          ...filter,
          remark: {
            not: null,
          },
        },
      });

      const skip = (page - 1) * perPage;

      // Determine the last available page
      const lastPage = Math.ceil(totalItems / perPage);

      // Check if the requested page exceeds the last available page
      if (page > lastPage) {
        return {
          data: [],
          meta: {
            currentPage: Number(page),
            totalItems,
            lastpage: lastPage,
            totalItemsPerPage: 0,
          },
          message: 'Pagination remark retrieved',
          status: HttpStatus.OK,
          time: new Date(),
        };
      }

      const approvalList = await this.prisma.approval.findMany({
        skip,
        take: perPage,
        orderBy: {
          createdAt: order.toLowerCase() as SortOrder,
        },
        where: {
          ...filter,
          remark: {
            not: null,
          },
        },
      });

      const realization = approvalList.map((approval) => approval.tableId);

      const realizationList = await this.prisma.realization.findMany({
        where: {
          idRealization: {
            in: realization,
          },
        },
      });

      const data = approvalList.map((approval) => {
        const relatedRealization = realizationList.find(
          (realization) => realization.idRealization === approval.tableId,
        );

        return {
          dateOfRemark: approval.createdAt,
          status: approval.status,
          statusFrom: approval.createdBy,
          departmentFrom: approval.unit,
          remark: approval.remark,
          statusTo: relatedRealization.createdBy,
          departmentTo: relatedRealization.department,
        };
      });

      const remainingItems = totalItems - skip;
      const isLastPage = page * perPage >= totalItems;
      const totalItemsPerPage = isLastPage ? remainingItems : perPage;

      return {
        data,
        meta: {
          currentPage: Number(page),
          totalItems,
          lastpage: Math.ceil(totalItems / perPage),
          totalItemsPerPage: Number(totalItemsPerPage),
        },
        message: 'Pagination remark retrieved',
        status: HttpStatus.OK,
        time: new Date(),
      };
    } catch (error) {
      // Handle errors
      if (error instanceof BadRequestException) {
        throw new BadRequestException(
          'Invalid filter parameters. ' + error.message,
        );
      } else {
        throw new InternalServerErrorException(
          'Internal Server Error: ' + error.message,
        );
      }
    }
  }
}
