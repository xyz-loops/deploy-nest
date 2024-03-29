import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/service/prisma.service'; // Import the Prisma service for database operations.
import { CreateMCostCenterDto } from './dto/create-m-cost-center.dto';
import { UpdateMCostCenterDto } from './dto/update-m-cost-center.dto';
import { SortOrder } from '@elastic/elasticsearch/lib/api/types';

@Injectable()
export class MCostCenterService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMCostCenterDto: CreateMCostCenterDto) {
    try {
      const costCenter = await this.prisma.mCostCenter.create({
        data: createMCostCenterDto,
      });
      return {
        data: costCenter,
        meta: null,
        message: 'Cost center created successfully',
        status: HttpStatus.CREATED,
        time: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Failed to create cost center',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          time: new Date(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const costCenters = await this.prisma.mCostCenter.findMany();
    return {
      data: costCenters,
      meta: null,
      message: 'All cost center retrieved',
      status: HttpStatus.OK,
      time: new Date(),
    };
  }

  async findOne(id: number) {
    const costCenter = await this.prisma.mCostCenter.findUnique({
      where: { idCostCenter: id },
    });
    if (!costCenter) {
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Cost Center not found',
          status: HttpStatus.NOT_FOUND,
          time: new Date(),
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      data: costCenter,
      meta: null,
      message: 'Cost Center found',
      status: HttpStatus.OK,
      time: new Date(),
    };
  }

  async findBidang(bidang: string) {
    const costcenter = await this.prisma.mCostCenter.findMany({
      where: { bidang: bidang },
    });
    if (!costcenter || costcenter.length === 0) {
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Cost Center not found',
          status: HttpStatus.NOT_FOUND,
          time: new Date(),
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      data: costcenter,
      meta: null,
      message: 'Cost Center found',
      status: HttpStatus.OK,
      time: new Date(),
    };
  }

  async groupingByDinas() {
    try {
      const costCenters = await this.prisma.mCostCenter.findMany({
        distinct: ['dinas'],
        orderBy: { dinas: 'asc' },
      });

      const costcenter = costCenters.map((costCenter) => costCenter.dinas);

      return {
        data: costcenter,
        meta: null,
        message: 'Cost Centers grouped by dinas',
        status: HttpStatus.OK,
        time: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Failed to group cost centers by dinas',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          time: new Date(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findDinas(dinas: string, bidang: string) {
    const costcenter = await this.prisma.mCostCenter.findMany({
      where: { dinas, bidang: dinas },
      select: {
        idCostCenter: true,
        uniqueId: true,
        bidang: true,
        dinas: true,
      },
    });
    if (!costcenter || costcenter.length === 0) {
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Cost Center not found',
          status: HttpStatus.NOT_FOUND,
          time: new Date(),
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      data: costcenter,
      meta: null,
      message: 'Cost Center found',
      status: HttpStatus.OK,
      time: new Date(),
    };
  }

  async findAllPaginated(
    page: number,
    orderBy: string = 'asc',
    queryParams: any,
  ) {
    const perPage = 10;
    // Validate order input
    if (!['asc', 'desc'].includes(orderBy.toLowerCase())) {
      throw new BadRequestException(
        'Invalid order parameter. Use "asc" or "desc".',
      );
    }

    const { dinas } = queryParams;
    let filter: any = {};
    if (dinas) {
      filter.dinas = dinas; // konversi ke number jika diperlukan
    }

    const skip = (page - 1) * perPage;

    const totalItems = await this.prisma.mCostCenter.count({
      where: filter,
    });

    const costCenters = await this.prisma.mCostCenter.findMany({
      skip,
      take: perPage,
      where: filter,
      orderBy: {
        updatedAt: orderBy.toLowerCase() as SortOrder,
      },
    });

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

    // Menghitung jumlah item yang tersisa pada halaman terakhir
    // const remainingItems = totalItems % perPage;
    const remainingItems = totalItems - skip;

    // Memeriksa apakah ini adalah halaman terakhir
    const isLastPage = page * perPage >= totalItems;

    const totalItemsPerPage = isLastPage ? remainingItems : perPage;
    // const totalItemsPerPage1 = min(perPage, remainingItems);
    return {
      data: costCenters,
      meta: {
        currentPage: Number(page),
        totalItems,
        lastpage: Math.ceil(totalItems / perPage),
        totalItemsPerPage: Number(totalItemsPerPage),
        // totalItemsPerPages: Number(totalItemsPerPage1),
      },
      message: 'Paginated Cost Centers retrieved',
      status: HttpStatus.OK,
      time: new Date(),
    };
  }

  async update(id: number, updateDto: UpdateMCostCenterDto) {
    // Check if the MCostCenter exists
    const existingCostCenter = await this.prisma.mCostCenter.findUnique({
      where: { idCostCenter: id },
    });
    if (!existingCostCenter) {
      throw new NotFoundException(`Cost Center with ID ${id} not found`);
    }
    const costCenter = await this.prisma.mCostCenter.update({
      where: { idCostCenter: id },
      data: updateDto,
    });
    return {
      data: costCenter,
      meta: null,
      time: new Date(),
    };
  }

  async remove(id: number) {
    // Check if the MCostCenter exists
    const existingCostCenter = await this.findOne(id);

    const costCenter = await this.prisma.mCostCenter.delete({
      where: { idCostCenter: id },
    });

    return {
      data: costCenter,
      meta: null,
      time: new Date(),
    };
  }
}
