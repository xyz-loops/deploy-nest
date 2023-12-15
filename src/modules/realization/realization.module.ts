import { Module } from '@nestjs/common';
import { RealizationController } from './realization.controller';
import { RealizationService } from './realization.service';
import { PrismaService } from 'src/core/service/prisma.service';
import { MulterModule } from '@nestjs/platform-express/multer';
import { RoleService } from '../role/role.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [RealizationController],
  imports: [MulterModule, HttpModule],
  providers: [RealizationService, PrismaService, RoleService],
})
export class RealizationModule {}
