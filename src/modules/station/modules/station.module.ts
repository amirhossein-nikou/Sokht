import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { StationModel } from '../models/station.model';
import { UserModule } from '../../user/user.module';
import { LocationModule } from '../../location/location.module';
import { StationController } from '../controller/station.controller';
import { StationService } from '../services/station.service';
import { SaleService } from '../services/sale.service';
import { SaleController } from '../controller/sale.controller';
import { AverageSaleModel } from '../models/sale.model';
import { InventoryModel } from '../models/inventory.model';
import { InventoryService } from '../services/inventory.service';
import { InventoryController } from '../controller/inventory.controller';
import { AuthModule } from 'src/modules/auth/auth.module';


@Module({
  imports: [SequelizeModule.forFeature([StationModel, AverageSaleModel,InventoryModel]), UserModule, LocationModule,AuthModule],
  controllers: [StationController, SaleController,InventoryController],
  providers: [StationService, SaleService,InventoryService],
  exports: [StationService, SequelizeModule]
})
export class StationModule { }
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibW9iaWxlIjoiMDkzNjk4NTc1OTIiLCJpYXQiOjE3NDI4MzUwNTcsImV4cCI6MTc0NTQyNzA1N30.8koQvAp9hwi75OMFdr5SeItPGwLVfZgSnWZA1NM101o
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibW9iaWxlIjoiMDkxNzU1MDA3NjciLCJpYXQiOjE3NDI4MzUyNDIsImV4cCI6MTc0NTQyNzI0Mn0.Vlui-VkCjNis4Ux4ZEdBXBhM8DWX0AUo-wgbACJclTk