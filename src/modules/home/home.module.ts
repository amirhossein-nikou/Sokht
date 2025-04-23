import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { InventoryModule } from '../station/modules/inventory.module';
import { CargoModule } from '../cargo/cargo.module';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { StationModule } from '../station/modules/station.module';


@Module({
  imports: [
    AuthModule,InventoryModule,CargoModule
  ],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule { }
