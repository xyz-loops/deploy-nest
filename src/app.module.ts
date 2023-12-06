import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MCostCenterModule } from './modules/m-cost-center/m-cost-center.module';
import { KursModule } from './modules/kurs/kurs.module';
import { MGlAccountModule } from './modules/m-gl-account/m-gl-account.module';

@Module({
  imports: [MCostCenterModule, KursModule, MGlAccountModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
