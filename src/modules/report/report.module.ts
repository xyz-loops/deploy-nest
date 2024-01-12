import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { PrismaService } from 'src/core/service/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { RoleService } from '../role/role.service';

@Module({
  controllers: [ReportController],
  imports: [HttpModule],
  providers: [ReportService, PrismaService, RoleService],
})
export class ReportModule {}
