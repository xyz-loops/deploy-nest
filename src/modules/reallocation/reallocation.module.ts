import { Module } from '@nestjs/common';
import { ReallocationService } from './reallocation.service';
import { ReallocationController } from './reallocation.controller';

@Module({
  controllers: [ReallocationController],
  providers: [ReallocationService],
})
export class ReallocationModule {}
