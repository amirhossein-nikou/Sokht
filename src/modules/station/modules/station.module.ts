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
  imports: [TypeOrmModule.forFeature([StationEntity, AverageSaleEntity,InventoryEntity]), UserModule, LocationModule,AuthModule],
  controllers: [StationController, SaleController,InventoryController],
  providers: [StationService, SaleService,InventoryService],
  exports: [StationService, TypeOrmModule]
})
export class StationModule { }
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibW9iaWxlIjoiMDkzNjk4NTc1OTIiLCJpYXQiOjE3NDI4MzUwNTcsImV4cCI6MTc0NTQyNzA1N30.8koQvAp9hwi75OMFdr5SeItPGwLVfZgSnWZA1NM101o
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibW9iaWxlIjoiMDkxNzU1MDA3NjciLCJpYXQiOjE3NDI4MzUyNDIsImV4cCI6MTc0NTQyNzI0Mn0.Vlui-VkCjNis4Ux4ZEdBXBhM8DWX0AUo-wgbACJclTk