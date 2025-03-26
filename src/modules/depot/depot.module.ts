import { Module } from '@nestjs/common';
import { DepotService } from './depot.service';
import { DepotController } from './depot.controller';

@Module({
  controllers: [DepotController],
  providers: [DepotService],
})
export class DepotModule {}
