import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { UpdateApprovalDto } from './dto/update-approval.dto';
import { PrismaService } from 'src/core/service/prisma/prisma.service';
import { StatusEnum } from '@prisma/client';
import { SortOrder } from '@elastic/elasticsearch/lib/api/types';

@Injectable()
export class ApprovalService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllWithPaginationAndFilter(
    page: number,
    order: string = 'asc',
    nopeg: string,
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
        filter.statusTo = statusTo;
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
        where: filter,
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
          personalNumberTo: nopeg,
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
          typeOfLetter: 'Realisasi Anggaran',
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

  async reject(id: number) {
    try {
      const rejectRealization = await this.prisma.realization.update({
        where: { idRealization: id },
        data: {
          status: StatusEnum.REJECT,
        },
      });
      return {
        data: rejectRealization,
        meta: null,
        message: 'Realization reject successfully',
        status: HttpStatus.OK,
        time: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Failed to reject realization',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          time: new Date(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
