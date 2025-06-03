import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entity/user.entity';
import { NotificationEntity } from './entity/notification.entity';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity,UserEntity])],
  controllers: [],
  providers: [JwtService,NotificationGateway,NotificationService],
  exports: [NotificationGateway,NotificationService,TypeOrmModule]
})
export class NotificationModule {}
