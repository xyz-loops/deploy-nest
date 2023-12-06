import { Module } from '@nestjs/common';
import { RealizationService } from './realization.service';
import { RealizationController } from './realization.controller';

@Module({
  controllers: [RealizationController],
  providers: [RealizationService],
})
export class RealizationModule {}
