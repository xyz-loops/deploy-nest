import { Module } from '@nestjs/common';
import { MStatusService } from './m-status.service';
import { MStatusController } from './m-status.controller';
import { PrismaService } from 'src/core/service/prisma/prisma.service';

@Module({
  controllers: [MStatusController],
  providers: [MStatusService, PrismaService],
})
export class MStatusModule {}
