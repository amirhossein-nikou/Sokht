import { Module } from '@nestjs/common';
import { CargoService } from './cargo.service';
import { CargoController } from './cargo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CargoEntity } from './entities/cargo.entity';
import { RequestModule } from '../request/request.module';
import { AuthModule } from '../auth/auth.module';
import { TankerModule } from '../tanker/tanker.module';

@Module({
  imports: [TypeOrmModule.forFeature([CargoEntity]),RequestModule,AuthModule,TankerModule],
  controllers: [CargoController],
  providers: [CargoService],
  exports: [CargoService,TypeOrmModule]
})
export class CargoModule {}
