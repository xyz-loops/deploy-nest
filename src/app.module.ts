import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MCostCenterModule } from './modules/m-cost-center/m-cost-center.module';
import { KursModule } from './modules/kurs/kurs.module';
import { MGlAccountModule } from './modules/m-gl-account/m-gl-account.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [MCostCenterModule, KursModule, MGlAccountModule, DashboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
