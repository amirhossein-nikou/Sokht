import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CargoModule } from '../cargo/cargo.module';
import { InventoryModule } from '../station/modules/inventory.module';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { NotificationGateway } from '../notification/notification.gateway';
import { NotificationModule } from '../notification/notification.module';


@Module({
  imports: [
    AuthModule,InventoryModule,CargoModule,NotificationModule
  ],
  controllers: [HomeController],
  providers: [HomeService,NotificationGateway],
  exports: [HomeService]
})
export class HomeModule { }
