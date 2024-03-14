import { Module } from '@nestjs/common';
import { ReallocationService } from './reallocation.service';
import { ReallocationController } from './reallocation.controller';
import { PrismaService } from 'src/core/service/prisma.service';
import { RoleService } from '../role/role.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [ReallocationController],
  imports: [HttpModule],
  providers: [ReallocationService, PrismaService, RoleService],
})
export class ReallocationModule {}
