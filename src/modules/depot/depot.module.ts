import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationModule } from '../location/location.module';
import { UserModule } from '../user/user.module';
import { DepotController } from './depot.controller';
import { DepotService } from './depot.service';
import { DepotEntity } from './entity/depot.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([DepotEntity]), UserModule, LocationModule,AuthModule],
  controllers: [DepotController],
  providers: [DepotService],
  exports: [DepotService,TypeOrmModule]
})
export class DepotModule { }
