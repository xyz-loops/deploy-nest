import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMGlAccountDto } from './dto/create-m-gl-account.dto';
import { UpdateMGlAccountDto } from './dto/update-m-gl-account.dto';
import { PrismaService } from 'src/core/service/prisma.service';
import { glAccount } from 'prisma/dummy-data';

@Injectable()
export class MGlAccountService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMGlAccountDto: CreateMGlAccountDto) {
    try {
      console.log(createMGlAccountDto);
      const mGlAccount = await this.prisma.mGlAccount.create({
        data: createMGlAccountDto,
      });
      return {
        data: mGlAccount,
        meta: null,
        message: 'Gl Account created successfully',
        status: HttpStatus.CREATED,
        time: new Date(),
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Failed to create Gl Account',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          time: new Date(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const mGlAccount = await this.prisma.mGlAccount.findMany();
    return {
      data: mGlAccount,
      meta: null,
      message: 'All Gl Account retrieved',
      status: HttpStatus.OK,
      time: new Date(),
    };
  }

  async groupingByGroup() {
    try {
      const GroupGl = await this.prisma.mGlAccount.findMany({
        distinct: ['groupGl'],
      });
      const uniqueGroupGlValues = GroupGl.map((GroupGl) => GroupGl.groupGl);

      return {
        data: uniqueGroupGlValues,
        meta: null,
        message: 'Group Gl',
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

  async findGroup(groupGl: string) {
    const glAccount = await this.prisma.mGlAccount.findMany({
      where: { groupGl: groupGl },
      select: {
        idGlAccount: true,
        groupDetail: true,
        glAccount: true,
      },
    });
    if (!glAccount || glAccount.length === 0) {
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
      data: glAccount,
      meta: null,
      message: 'Cost Center found',
      status: HttpStatus.OK,
      time: new Date(),
    };
  }

  async findOne(id: number) {
    const mGlAccount = await this.prisma.mGlAccount.findUnique({
      where: { idGlAccount: id },
    });
    if (!mGlAccount) {
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Gl Account not found',
          status: HttpStatus.NOT_FOUND,
          time: new Date(),
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      data: mGlAccount,
      meta: null,
      message: 'Gl Account found',
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

    const glAccount = await this.prisma.mGlAccount.findMany({
      skip,
      take: perPage,
      // orderBy: {
      //   years: order.toLowerCase() as SortOrder,
      // },
    });

    const totalItems = await this.prisma.mGlAccount.count();

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
      data: glAccount,
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

  async update(id: number, updateMGlAccountDto: UpdateMGlAccountDto) {
    //Validation ID
    const existingGlAccount = await this.prisma.mGlAccount.findUnique({
      where: { idGlAccount: id },
    });
    if (!existingGlAccount) {
      throw new NotFoundException(`Gl Account with ID ${id} not found`);
    }
    try {
      const updatedMGlAccount = await this.prisma.mGlAccount.update({
        where: { idGlAccount: id },
        data: updateMGlAccountDto,
      });
      return {
        data: updatedMGlAccount,
        meta: null,
        message: 'Gl Account updated successfully',
        status: HttpStatus.OK,
        time: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Failed to update Gl Account',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          time: new Date(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    const existingGlAccount = await this.prisma.mGlAccount.findUnique({
      where: { idGlAccount: id },
    });
    if (!existingGlAccount) {
      throw new NotFoundException(`GL Account with id ${id} not found`);
    }
    try {
      const deleteGlAccount = await this.prisma.mGlAccount.delete({
        where: { idGlAccount: id },
      });
      return {
        data: deleteGlAccount,
        meta: null,
        message: 'GL Account deleted successfully',
        status: HttpStatus.OK,
        time: new Date(),
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Failed to delete GL Account',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          time: new Date(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
