import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { PrismaService } from 'src/core/service/prisma.service';
import { SortOrder } from '@elastic/elasticsearch/lib/api/types';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  create(createDashboardDto: CreateDashboardDto) {
    return 'This action adds a new dashboard';
  }

  async findAll() {
    const realization = await this.prisma.realization.findMany({
      include: {
        m_cost_center: true,
        realizationItem: true,
      },
    });

    const realizationWithAmount = realization.map((realizationItem) => {
      // Calculate total amount for each realization using reduce
      const totalAmount = realizationItem.realizationItem.reduce(
        (accumulator, currentItem) => accumulator + (currentItem.amount || 0),
        0,
      );

      return {
        idRealization: realizationItem.idRealization,
        requestNumber: realizationItem.requestNumber,
        entryDate: realizationItem.createdAt,
        m_cost_center: realizationItem.m_cost_center,
        status: realizationItem.status,
        typeSubmission: realizationItem.type,
        statusTo: realizationItem.personalNumberTo,
        departmentTo: realizationItem.departmentTo,
        submissionValue: totalAmount,
        description: realizationItem.titleRequest,
        createdAt: realizationItem.createdAt,
        updatedAt: realizationItem.updatedAt,
      };
    });

    return {
      data: realizationWithAmount,
      meta: null,
      message: 'All realization retrieved',
      status: HttpStatus.OK,
      time: new Date(),
    };
  }

  async findAllWithPaginationAndFilter(
    page: number,
    order: string = 'asc',
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
        status,
        years,
        type,
        requestNumber,
        dinas,
        entryDate,
        entryDateTo,
      } = queryParams;
      let filter: any = {};
      if (years) {
        filter.years = +years; // konversi ke number jika diperlukan
      }
      if (requestNumber) {
        filter.requestNumber = requestNumber; // konversi ke number jika diperlukan
      }
      if (status) {
        filter.status = status;
      }
      if (type) {
        filter.type = type; // konversi ke number jika diperlukan
      }
      if (dinas) {
        filter.m_cost_center = { dinas: dinas };
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
        where: filter,
        include: {
          m_cost_center: {
            select: {
              idCostCenter: true,
              costCenter: true,
              description: true,
              bidang: true,
              dinas: true,
              directorat: true,
              groupDinas: true,
              profitCenter: true,
              active: true,
            },
          },
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
          requestNumber: realizationItem.requestNumber,
          entryDate: realizationItem.createdAt,
          m_cost_center: realizationItem.m_cost_center,
          status: realizationItem.status,
          typeSubmission: realizationItem.type,
          statusTo: realizationItem.personalNumberTo,
          departmentTo: realizationItem.departmentTo,
          submissionValue: totalAmount,
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
          // totalItemsPerPage: Number(isLastPage ? remainingItems : perPage),
          totalItemsPerPage: Number(totalItemsPerPage),
        },
        message: 'Pagination dashboard retrieved',
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

  // async findAllRealization(queryParams: any) {
  //   try {
  //     // Dapatkan nilai filter dari queryParams
  //     const { status, years, type, requestNumber } = queryParams;

  //     // Logika filter sesuai dengan kebutuhan
  //     let filter: any = {};
  //     if (years) {
  //       filter.years = +years; // konversi ke number jika diperlukan
  //     }
  //     if (requestNumber) {
  //       filter.type = +requestNumber; // konversi ke number jika diperlukan
  //     }
  //     if (status) {
  //       filter.status = status;
  //     }
  //     if (type) {
  //       filter.type = type; // konversi ke number jika diperlukan
  //     }

  //     // Panggil metode prisma atau logika lainnya dengan filter
  //     const realization = await this.prisma.realization.findMany({
  //       where: filter,
  //       include: {
  //         realizationItem: true,
  //       },
  //     });

  //     if (!realization || realization.length === 0) {
  //       throw new NotFoundException(
  //         'No realizations found with the specified filter.',
  //       );
  //     }

  //     return realization;
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       throw error; // NestJS will handle NotFoundException and send a 404 response
  //     } else {
  //       // Log the error or handle other types of errors
  //       throw new BadRequestException('Invalid request.'); // NestJS will handle BadRequestException and send a 400 response
  //     }
  //   }
  // }

  // async findAllPaginated(page: number, perPage, order: string = 'asc') {
  //   if (!['asc', 'desc'].includes(order.toLowerCase())) {
  //     throw new BadRequestException(
  //       'Invalid order parameter. Use "asc" or "desc".',
  //     );
  //   }

  //   const skip = (page - 1) * perPage;

  //   const realization = await this.prisma.realization.findMany({
  //     skip,
  //     take: parseInt(perPage),
  //     orderBy: {
  //       updatedAt: order.toLowerCase() as SortOrder,
  //     },
  //     include: {
  //       m_cost_center: true,
  //       realizationItem: true,
  //     },
  //   });

  //   const totalItems = await this.prisma.realization.count();

  //   // Menghitung jumlah item yang tersisa pada halaman terakhir
  //   const remainingItems = totalItems % perPage;

  //   // Memeriksa apakah ini adalah halaman terakhir
  //   const isLastPage = page * perPage >= totalItems;

  //   const realizationWithFileUpload = realization.map((realizationItem) => {
  //     // Calculate total amount for each realization using reduce
  //     const totalAmount = realizationItem.realizationItem.reduce(
  //       (accumulator, currentItem) => accumulator + (currentItem.amount || 0),
  //       0,
  //     );

  //     return {
  //       idRealization: realizationItem.idRealization,
  //       requestNumber: realizationItem.requestNumber,
  //       entryDate: realizationItem.createdAt,
  //       m_cost_center: realizationItem.m_cost_center,
  //       status: realizationItem.status,
  //       typeSubmission: realizationItem.type,
  //       statusTo: realizationItem.personalNumberTo,
  //       departmentTo: realizationItem.departmentTo,
  //       submissionValue: totalAmount,
  //       description: realizationItem.titleRequest,
  //     };
  //   });

  //   return {
  //     data: realizationWithFileUpload,
  //     meta: {
  //       currentPage: Number(page),
  //       totalItems,
  //       lastpage: Math.ceil(totalItems / perPage),
  //       totalItemsPerPage: Number(isLastPage ? remainingItems : perPage),
  //     },
  //     message: 'Pagination dashboard retrieved',
  //     status: HttpStatus.OK,
  //     time: new Date(),
  //   };
  // }

  async getRealizationTypeCounts() {
    const totalRealizations = await this.prisma.realization.count();

    const realizationTypeCounts = await this.prisma.realization.groupBy({
      by: ['status'],
      _count: true,
    });

    return realizationTypeCounts.map((countStatus) => ({
      type: countStatus.status,
      count: countStatus._count,
      percentage: Number(
        ((countStatus._count / totalRealizations) * 100).toFixed(2),
      ),
    }));
  }

  findOne(id: number) {
    return `This action returns a #${id} dashboard`;
  }

  update(id: number, updateDashboardDto: UpdateDashboardDto) {
    return `This action updates a #${id} dashboard`;
  }

  remove(id: number) {
    return `This action removes a #${id} dashboard`;
  }
}
