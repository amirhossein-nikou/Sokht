import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CargoModule } from '../cargo/cargo.module';
import { DepotModule } from '../depot/depot.module';
import { NotificationGateway } from '../notification/notification.gateway';
import { NotificationModule } from '../notification/notification.module';
import { RequestModule } from '../request/request.module';
import { InventoryModule } from '../station/modules/inventory.module';
import { StationModule } from '../station/modules/station.module';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';


@Module({
  imports: [
    AuthModule,InventoryModule,CargoModule,NotificationModule,RequestModule,DepotModule,StationModule
  ],
  controllers: [HomeController],
  providers: [HomeService,NotificationGateway],
  exports: [HomeService]
})
export class HomeModule { }
