import { Global, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './entity/notification.entity';
import { AuthModule } from 'src/modules/auth/auth.module';
import { NotificationGateway } from './notification.gateway';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../user/entity/user.entity';
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity,UserEntity])],
  controllers: [],
  providers: [JwtService,NotificationGateway,NotificationService],
  exports: [NotificationGateway,NotificationService,TypeOrmModule]
})
export class NotificationModule {}
