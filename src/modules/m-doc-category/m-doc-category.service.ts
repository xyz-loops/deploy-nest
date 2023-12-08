import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMDocCategoryDto } from './dto/create-m-doc-category.dto';
import { UpdateMDocCategoryDto } from './dto/update-m-doc-category.dto';
import { PrismaService } from 'src/core/service/prisma/prisma.service';

@Injectable()
export class MDocCategoryService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createMDocCategoryDto: CreateMDocCategoryDto) {
    try {
      const docCategory = await this.prisma.mDocCategory.create({
        data: createMDocCategoryDto,
      });
      return {
        data: docCategory,
        meta: null,
        message: 'Document category created successfully',
        status: HttpStatus.CREATED,
        time: new Date(),
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Failed to create document category',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          time: new Date(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const docCategory = await this.prisma.mDocCategory.findMany();
    return {
      data: docCategory,
      meta: null,
      message: 'All document category retrieved',
      status: HttpStatus.OK,
      time: new Date(),
    };
  }

  async findOne(id: number) {
    const docCategory = await this.prisma.mDocCategory.findUnique({
      where: { idDocCategory: id },
    });
    if (!docCategory) {
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Document category not found',
          status: HttpStatus.NOT_FOUND,
          time: new Date(),
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      data: docCategory,
      meta: null,
      message: 'Document category found',
      status: HttpStatus.OK,
      time: new Date(),
    };
  }

  async update(id: number, updateMDocCategoryDto: UpdateMDocCategoryDto) {
    const existingDocCategory = await this.prisma.mDocCategory.findUnique({
      where: { idDocCategory: id },
    });
    if (!existingDocCategory) {
      throw new NotFoundException(`Document category with id ${id} not found`);
    }
    try {
      const updatedDocCategory = await this.prisma.mDocCategory.update({
        where: { idDocCategory: id },
        data: updateMDocCategoryDto,
      });
      return {
        data: updatedDocCategory,
        meta: null,
        message: 'Document category updated successfully',
        status: HttpStatus.OK,
        time: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Failed to document category',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          time: new Date(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    const existingDocCategory = await this.prisma.mDocCategory.findUnique({
      where: { idDocCategory: id },
    });
    if (!existingDocCategory) {
      throw new NotFoundException(`Document category with id ${id} not found`);
    }
    try {
      const deleteDocCategory = await this.prisma.mDocCategory.delete({
        where: { idDocCategory: id },
      });
      return {
        data: deleteDocCategory,
        meta: null,
        message: 'Document category deleted successfully',
        status: HttpStatus.OK,
        time: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        {
          data: null,
          meta: null,
          message: 'Failed to delete document category',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          time: new Date(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
