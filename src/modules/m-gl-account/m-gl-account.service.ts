import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMGlAccountDto } from './dto/create-m-gl-account.dto';
import { UpdateMGlAccountDto } from './dto/update-m-gl-account.dto';
import { PrismaService } from 'src/core/service/prisma/prisma.service';

@Injectable()
export class MGlAccountService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMGlAccountDto: CreateMGlAccountDto) {
    try {
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
