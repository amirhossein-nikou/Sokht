import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { LocationModule } from '../../location/location.module';
import { UserModule } from '../../user/user.module';
import { SaleController } from '../controller/sale.controller';
import { StationController } from '../controller/station.controller';
import { SaleService } from '../services/sale.service';
import { StationService } from '../services/station.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationEntity } from '../entity/station.entity';
import { AverageSaleEntity } from '../entity/sale.entity';
import { FuelTypeModule } from 'src/modules/fuel-type/fuel-type.module';

@Module({
  imports: [TypeOrmModule.forFeature([StationEntity, AverageSaleEntity])
  , UserModule, LocationModule,AuthModule,FuelTypeModule],
  controllers: [StationController, SaleController],
  providers: [StationService, SaleService],
  exports: [StationService,SaleService ,TypeOrmModule]
})
export class StationModule { }