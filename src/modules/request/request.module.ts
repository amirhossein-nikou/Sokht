import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DepotModule } from '../depot/depot.module';
import { FuelTypeModule } from '../fuel-type/fuel-type.module';
import { InventoryModule } from '../station/modules/inventory.module';
import { StationModule } from '../station/modules/station.module';
import { InventoryService } from '../station/services/inventory.service';
import { UserModule } from '../user/user.module';
import { RequestEntity } from './entities/request.entity';
import { StatusEntity } from './entities/status.entity';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { CargoEntity } from '../cargo/entities/cargo.entity';
import { RequestServiceAndroid } from './request.android.service';

@Module({
  imports: [TypeOrmModule.forFeature([RequestEntity, StatusEntity,CargoEntity]),
    AuthModule, StationModule, InventoryModule, UserModule, DepotModule, FuelTypeModule],
  controllers: [RequestController],
  providers: [RequestService, InventoryService,RequestServiceAndroid],
  exports: [RequestService, TypeOrmModule,RequestServiceAndroid]
})

export class RequestModule { }
