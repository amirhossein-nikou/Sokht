import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CargoModule } from '../cargo/cargo.module';
import { NotificationGateway } from '../socket/notification.gateway';
import { InventoryModule } from '../station/modules/inventory.module';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';


@Module({
  imports: [
    AuthModule,InventoryModule,CargoModule
  ],
  controllers: [HomeController],
  providers: [HomeService,NotificationGateway],
  exports: [HomeService]
})
export class HomeModule { }
