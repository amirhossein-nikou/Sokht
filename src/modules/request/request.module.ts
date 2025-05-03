import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestEntity } from './entities/request.entity';
import { AuthModule } from '../auth/auth.module';
import { StationModule } from '../station/modules/station.module';
import { DepotModule } from '../depot/depot.module';
import { InventoryService } from '../station/services/inventory.service';
import { InventoryModule } from '../station/modules/inventory.module';
import { UserModule } from '../user/user.module';
import { StatusEntity } from './entities/status.entity';
import { SaleService } from '../station/services/sale.service';
import { FuelTypeModule } from '../fuel-type/fuel-type.module';

@Module({
  imports: [TypeOrmModule.forFeature([RequestEntity, StatusEntity]),
    AuthModule, StationModule, InventoryModule, UserModule, DepotModule, FuelTypeModule],
  controllers: [RequestController],
  providers: [RequestService, InventoryService],
  exports: [RequestService, TypeOrmModule]
})

export class RequestModule { }
