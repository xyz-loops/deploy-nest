import { Module } from '@nestjs/common';
import { MGlAccountService } from './m-gl-account.service';
import { MGlAccountController } from './m-gl-account.controller';
import { PrismaService } from 'src/core/service/prisma.service';

@Module({
  controllers: [MGlAccountController],
  providers: [MGlAccountService, PrismaService],
})
export class MGlAccountModule {}
