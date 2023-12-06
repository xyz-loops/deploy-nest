import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MCostCenterModule } from './modules/m-cost-center/m-cost-center.module';
import { KursModule } from './modules/kurs/kurs.module';

@Module({
  imports: [MCostCenterModule, KursModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
