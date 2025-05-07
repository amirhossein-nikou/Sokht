import { Module } from '@nestjs/common';
import { TankerService } from './tanker.service';
import { TankerController } from './tanker.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TankerEntity } from './entities/tanker.entity';
import { UserModule } from '../user/user.module';
import { DepotModule } from '../depot/depot.module';
import { AuthModule } from '../auth/auth.module';
import { CargoModule } from '../cargo/cargo.module';

@Module({
  imports: [TypeOrmModule.forFeature([TankerEntity]),UserModule,DepotModule,AuthModule],
  controllers: [TankerController],
  providers: [TankerService],
  exports: [TankerService,TypeOrmModule]
})
export class TankerModule {}
