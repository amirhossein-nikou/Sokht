import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { FuelTypeModule } from '../fuel-type/fuel-type.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AuthModule,FuelTypeModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule { }
