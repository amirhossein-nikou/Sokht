import { Module } from '@nestjs/common';
import { CustomModule } from '../../common/config/module.config';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { StationModule } from '../station/modules/station.module';
import { LocationModule } from '../location/location.module';
import { DepotModule } from '../depot/depot.module';
import { TankerModule } from '../tanker/tanker.module';
import { InventoryModule } from '../station/modules/inventory.module';
import { HomeModule } from '../home/home.module';
import { TicketModule } from '../ticket/ticket.module';

@Module({
  imports: [
    CustomModule, HomeModule,UserModule, AuthModule,
    StationModule, InventoryModule, LocationModule,
    DepotModule, TankerModule,TicketModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
