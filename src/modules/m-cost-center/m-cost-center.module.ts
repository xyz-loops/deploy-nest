import { Module } from '@nestjs/common';
import { MCostCenterService } from './m-cost-center.service';
import { MCostCenterController } from './m-cost-center.controller';

@Module({
  controllers: [MCostCenterController],
  providers: [MCostCenterService],
})
export class MCostCenterModule {}
