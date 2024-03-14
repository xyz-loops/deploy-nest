import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateReallocationDto } from './dto/create-reallocation.dto';
import { UpdateReallocationDto } from './dto/update-reallocation.dto';
import { PrismaService } from 'src/core/service/prisma.service';
import { SortOrder } from '@elastic/elasticsearch/lib/api/types';
import { RoleService } from '../role/role.service';

@Injectable()
export class ReallocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roleService: RoleService,
  ) {}

  async findAllWithPaginationAndFilter(
    page: number,
    order: string = 'asc',
    personalNumberTo: string,
    queryParams: any,
    isTAB: boolean,
    isTXC3: boolean,
    isTAP: boolean,
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
        typeOfReallocation,
        status,
        statusTo,
        departmentTo,
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
      if (typeOfReallocation) {
        filter.type = typeOfReallocation; // konversi ke number jika diperlukan
      }
      if (status) {
        filter.status = status;
      }
      if (statusTo) {
        if (statusTo === 'TAB') {
          filter.personalNumberTo = null;
        } else if (statusTo === 'TXC-3') {
          filter.personalNumberTo = null;
        } else {
          filter.personalNumberTo = statusTo;
        }
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

      let conditions: any;
      if (isTAB === true) {
        conditions = {
          ...filter,
          OR: [
            { personalNumberTo: personalNumberTo },
            { personalNumberTo: null, departmentTo: 'TAB' },
          ],
        };
      } else if (isTXC3 === true) {
        conditions = {
          ...filter,
          OR: [
            { personalNumberTo: personalNumberTo },
            { personalNumberTo: null, departmentTo: 'TXC-3' },
          ],
        };
      } else if (isTAP === true) {
        conditions = {
          ...filter,
          OR: [
            { personalNumberTo: personalNumberTo },
            { personalNumberTo: null, departmentTo: 'TAP' },
          ],
        };
      } else {
        conditions = {
          ...filter,
          personalNumberTo: personalNumberTo,
        };
      }

      // Count total items with applied filters
      const totalItems = await this.prisma.reallocation.count({
        where: conditions,
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
        where: conditions,
        include: {
          realizationItem: true,
        },
      });

      // const remainingItems = totalItems % perPage;
      const remainingItems = totalItems - skip;
      const isLastPage = page * perPage >= totalItems;

      const realizationData = await Promise.all(
        realization.map(async (realizationItem) => {
          const totalAmount = realizationItem.realizationItem.reduce(
            (accumulator, currentItem) =>
              accumulator + (currentItem.amount || 0),
            0,
          );
          const name =
            realizationItem.personalNumberTo !== null
              ? await this.roleService.getName(realizationItem.personalNumberTo)
              : null;

          return {
            idRealization: realizationItem.idRealization,
            taReff: realizationItem.taReff,
            requestNumber: realizationItem.requestNumber,
            typeOfLetter: realizationItem.typeOfLetter,
            entryDate: realizationItem.createdAt,
            amountSubmission: totalAmount,
            status: realizationItem.status,
            statusTo: name !== null ? name : null,
            departmentTo: realizationItem.departmentTo,
            description: realizationItem.titleRequest,
          };
        }),
      );

      const totalItemsPerPage = isLastPage ? remainingItems : perPage;

      return {
        data: realizationData,
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

  create(createReallocationDto: CreateReallocationDto) {
    return 'This action adds a new reallocation';
  }

  findAll() {
    return `This action returns all reallocation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} reallocation`;
  }

  update(id: number, updateReallocationDto: UpdateReallocationDto) {
    return `This action updates a #${id} reallocation`;
  }

  remove(id: number) {
    return `This action removes a #${id} reallocation`;
  }
}
