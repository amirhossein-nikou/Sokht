import { Module } from '@nestjs/common';
import { TankerService } from './tanker.service';
import { TankerController } from './tanker.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TankerEntity } from './entities/tanker.entity';
import { UserModule } from '../user/user.module';
import { DepotModule } from '../depot/depot.module';
import { AuthModule } from '../auth/auth.module';
import { CargoModule } from '../cargo/cargo.module';
import { PlateEntity } from './entities/plate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TankerEntity,PlateEntity]),UserModule,DepotModule,AuthModule],
  controllers: [TankerController],
  providers: [TankerService],
  exports: [TankerService,TypeOrmModule]
})
export class TankerModule {}
