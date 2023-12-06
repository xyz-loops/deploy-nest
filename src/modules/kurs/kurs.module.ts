import { Module } from '@nestjs/common';
import { KursService } from './kurs.service';
import { KursController } from './kurs.controller';
import { PrismaService } from 'src/core/service/prisma/prisma.service';

@Module({
  controllers: [KursController],
  providers: [KursService, PrismaService],
})
export class KursModule {}
