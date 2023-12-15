import { Module } from '@nestjs/common';
import { MCostCenterService } from './m-cost-center.service';
import { MCostCenterController } from './m-cost-center.controller';
import { PrismaService } from 'src/core/service/prisma.service';

@Module({
  controllers: [MCostCenterController],
  providers: [MCostCenterService, PrismaService],
})
export class MCostCenterModule {}
