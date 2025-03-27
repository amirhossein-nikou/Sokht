import { Module } from '@nestjs/common';
import { CustomModule } from '../../common/config/module.config';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { StationModule } from '../station/modules/station.module';
import { LocationModule } from '../location/location.module';
import { DepotModule } from '../depot/depot.module';


@Module({
  imports: [CustomModule, UserModule, AuthModule,StationModule,LocationModule,DepotModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
