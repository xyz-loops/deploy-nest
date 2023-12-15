import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateKursDto } from './dto/create-kurs.dto';
import { UpdateKursDto } from './dto/update-kurs.dto';
import { PrismaService } from 'src/core/service/prisma.service';
import { SortOrder } from '@elastic/elasticsearch/lib/api/types';

@Injectable()
export class KursService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateKursDto) {
    try {
      const kurs = await this.prisma.mKurs.create({
        data: dto,
      });
      return {
        data: kurs,
        meta: null,
        message: 'Kurs created successfully',
        status: HttpStatus.CREATED,
        time: new Date(),
      };
    } catch (error) {
      // Tangkap kesalahan yang dihasilkan oleh database
      if (
        error.code === 'P2002' &&
        error.meta?.target?.[0]?.includes('years')
      ) {
        // Kolom years harus unik, dan kesalahan ini menunjukkan bahwa nilai years sudah ada
        throw new HttpException(
          `Kurs with years ${dto.years} already exists`,
          HttpStatus.CONFLICT,
        );
      } else {
        throw new HttpException(
          {
            data: null,
            meta: null,
            message: 'Failed to create kurs',
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            time: new Date(),
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async findAll() {
    const kurs = await this.prisma.mKurs.findMany({
      orderBy: {
        // Specify the field you want to sort by (e.g., 'createdAt') in descending order.
        years: 'desc', // Replace 'createdAt' with the actual field name you want to use.
      },
    });
    return {
      data: kurs,
      meta: null,
      message: 'All kurs retrieved',
      status: HttpStatus.OK,
      time: new Date(),
    };
  }

  async findOne(id: number) {
    const kurs = await this.prisma.mKurs.findUnique({ where: { idKurs: id } });
    if (!kurs) {
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Kurs not found',
          status: HttpStatus.NOT_FOUND,
          time: new Date(),
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      data: kurs,
      meta: null,
      message: 'Kurs found',
      status: HttpStatus.OK,
      time: new Date(),
    };
  }

  async findYears(years: number) {
    const kurs = await this.prisma.mKurs.findUnique({
      where: { years: years },
    });
    if (!kurs) {
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Years not found',
          status: HttpStatus.NOT_FOUND,
          time: new Date(),
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      data: kurs,
      meta: null,
      message: 'Years found',
      status: HttpStatus.OK,
      time: new Date(),
    };
  }

  async findAllPaginated(page: number, order: string = 'asc') {
    const perPage = 10;
    // Validate order input
    if (!['asc', 'desc'].includes(order.toLowerCase())) {
      throw new BadRequestException(
        'Invalid order parameter. Use "asc" or "desc".',
      );
    }
    const skip = (page - 1) * perPage;

    const kurs = await this.prisma.mKurs.findMany({
      skip,
      take: perPage,
      orderBy: {
        years: order.toLowerCase() as SortOrder,
      },
    });

    const totalItems = await this.prisma.mKurs.count();

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
      data: kurs,
      meta: {
        currentPage: Number(page),
        totalItems,
        lastpage: Math.ceil(totalItems / perPage),
        totalItemsPerPage: Number(totalItemsPerPage),
        // totalItemsPerPages: Number(totalItemsPerPage1),
      },
      message: 'Paginated kurs retrieved',
      status: HttpStatus.OK,
      time: new Date(),
    };
  }

  async update(id: number, updateKursDto: UpdateKursDto) {
    //Validation ID
    const existingKurs = await this.prisma.mKurs.findUnique({
      where: { idKurs: id },
    });
    if (!existingKurs) {
      throw new NotFoundException(`Kurs with ID ${id} not found`);
    }
    try {
      const updatedKurs = await this.prisma.mKurs.update({
        where: { idKurs: id },
        data: updateKursDto,
      });
      return {
        data: updatedKurs,
        meta: null,
        message: 'Kurs updated successfully',
        status: HttpStatus.OK,
        time: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Failed to update kurs',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          time: new Date(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    const existingkurs = await this.prisma.mKurs.findUnique({
      where: { idKurs: id },
    });
    if (!existingkurs) {
      throw new NotFoundException(`Kurs with id ${id} not found`);
    }
    try {
      const deleteKurs = await this.prisma.mKurs.delete({
        where: { idKurs: id },
      });
      return {
        data: deleteKurs,
        meta: null,
        message: 'Kurs deleted successfully',
        status: HttpStatus.OK,
        time: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Failed to delete Kurs',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          time: new Date(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
