import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/modules/auth/auth.module";
import { UserModule } from "src/modules/user/user.module";
import { InventoryController } from "../controller/inventory.controller";
import { InventoryEntity } from "../entity/inventory.entity";
import { InventoryService } from "../services/inventory.service";
import { StationModule } from "./station.module";
import { FuelTypeModule } from "src/modules/fuel-type/fuel-type.module";

@Module({
  imports: [TypeOrmModule.forFeature([InventoryEntity])
  , UserModule,StationModule,AuthModule,FuelTypeModule],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService,TypeOrmModule]
})
export class InventoryModule { }