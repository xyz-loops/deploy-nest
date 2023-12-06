import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MCostCenterModule } from './modules/m-cost-center/m-cost-center.module';
import { KursModule } from './modules/kurs/kurs.module';
import { MGlAccountModule } from './modules/m-gl-account/m-gl-account.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { Approval } from './modules/approval/entities/approval.entity';
import { MStatusModule } from './modules/m-status/m-status.module';
import { RealizationModule } from './modules/realization/realization.module';

@Module({
  imports: [
    Approval,
    DashboardModule,
    KursModule,
    MCostCenterModule,
    MGlAccountModule,
    MStatusModule,
    RealizationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
