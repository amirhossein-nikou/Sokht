import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { LocationModule } from '../../location/location.module';
import { UserModule } from '../../user/user.module';
import { InventoryController } from '../controller/inventory.controller';
import { SaleController } from '../controller/sale.controller';
import { StationController } from '../controller/station.controller';
import { InventoryService } from '../services/inventory.service';
import { SaleService } from '../services/sale.service';
import { StationService } from '../services/station.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationEntity } from '../entity/station.entity';
import { AverageSaleEntity } from '../entity/sale.entity';
import { InventoryEntity } from '../entity/inventory.entity';


@Module({
  imports: [TypeOrmModule.forFeature([StationEntity, AverageSaleEntity,InventoryEntity])
  , UserModule, LocationModule,AuthModule],
  controllers: [StationController, SaleController,InventoryController],
  providers: [StationService, SaleService,InventoryService],
  exports: [StationService, TypeOrmModule]
})
export class StationModule { }