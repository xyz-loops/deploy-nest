import { Module } from '@nestjs/common';
import { ApprovalService } from './approval.service';
import { ApprovalController } from './approval.controller';
import { PrismaService } from 'src/core/service/prisma/prisma.service';

@Module({
  controllers: [ApprovalController],
  providers: [ApprovalService, PrismaService],
})
export class ApprovalModule {}
