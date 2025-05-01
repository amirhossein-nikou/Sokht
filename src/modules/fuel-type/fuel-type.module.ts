import { Module } from '@nestjs/common';
import { FuelTypeService } from './fuel-type.service';
import { FuelTypeController } from './fuel-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FuelTypeEntity } from './entities/fuel-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FuelTypeEntity])],
  controllers: [FuelTypeController],
  providers: [FuelTypeService],
  exports: [FuelTypeService,TypeOrmModule]
})
export class FuelTypeModule {}
