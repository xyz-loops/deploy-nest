import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MCostCenterModule } from './modules/m-cost-center/m-cost-center.module';
import { KursModule } from './modules/kurs/kurs.module';
import { MGlAccountModule } from './modules/m-gl-account/m-gl-account.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { MStatusModule } from './modules/m-status/m-status.module';
import { RealizationModule } from './modules/realization/realization.module';
import { BudgetUploadModule } from './modules/budget-upload/budget-upload.module';
import { RoleModule } from './modules/role/role.module';
import { ApprovalModule } from './modules/approval/approval.module';
import { MDocCategoryModule } from './modules/m-doc-category/m-doc-category.module';
import { ReportModule } from './modules/report/report.module';
import { ReallocationModule } from './reallocation/reallocation.module';

@Module({
  imports: [
    ApprovalModule,
    BudgetUploadModule,
    DashboardModule,
    KursModule,
    MCostCenterModule,
    MDocCategoryModule,
    MGlAccountModule,
    MStatusModule,
    RealizationModule,
    ReportModule,
    RoleModule,
    ReallocationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
