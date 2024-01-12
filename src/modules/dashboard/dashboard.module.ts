import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaService } from 'src/core/service/prisma.service';
import { RoleService } from '../role/role.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [DashboardController],
  imports: [HttpModule],
  providers: [DashboardService, PrismaService, RoleService],
})
export class DashboardModule {}
