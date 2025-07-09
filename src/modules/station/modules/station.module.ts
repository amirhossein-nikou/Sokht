import { Module } from '@nestjs/common';
import { AuthModule } from '../../../modules/auth/auth.module';
import { LocationModule } from '../../location/location.module';
import { UserModule } from '../../user/user.module';
import { SaleController } from '../controller/sale.controller';
import { StationController } from '../controller/station.controller';
import { SaleService } from '../services/sale.service';
import { StationService } from '../services/station.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationEntity } from '../entity/station.entity';
import { AverageSaleEntity } from '../entity/sale.entity';
import { FuelTypeModule } from '../../../modules/fuel-type/fuel-type.module';
import { LimitService } from '../services/limit.service';
import { LimitEntity } from '../entity/limit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StationEntity, AverageSaleEntity,LimitEntity])
  , UserModule, LocationModule,AuthModule,FuelTypeModule],
  controllers: [StationController, SaleController],
  providers: [StationService, SaleService,LimitService],
  exports: [StationService,SaleService,LimitService ,TypeOrmModule]
})
export class StationModule { }