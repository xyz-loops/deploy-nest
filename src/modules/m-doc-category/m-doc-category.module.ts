import { Module } from '@nestjs/common';
import { MDocCategoryService } from './m-doc-category.service';
import { MDocCategoryController } from './m-doc-category.controller';
import { PrismaService } from 'src/core/service/prisma.service';

@Module({
  controllers: [MDocCategoryController],
  providers: [MDocCategoryService, PrismaService],
})
export class MDocCategoryModule {}
