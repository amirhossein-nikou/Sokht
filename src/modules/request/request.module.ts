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

@Module({
  imports: [TypeOrmModule.forFeature([RequestEntity]),
   AuthModule, StationModule,InventoryModule,UserModule,DepotModule],
  controllers: [RequestController],
  providers: [RequestService,InventoryService],
  exports: [RequestService,TypeOrmModule]
})

export class RequestModule { }
