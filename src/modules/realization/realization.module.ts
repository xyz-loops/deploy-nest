import { Module } from '@nestjs/common';
import { RealizationService } from './realization.service';
import { RealizationController } from './realization.controller';
import { PrismaService } from 'src/core/service/prisma/prisma.service';
import { FileUploadService } from './file-upload.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  controllers: [RealizationController],
  imports: [MulterModule],
  providers: [RealizationService, FileUploadService, PrismaService],
})
export class RealizationModule {}
