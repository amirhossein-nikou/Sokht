import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../user/entity/user.entity";
import { OtpEntity } from "./entity/otp.entity";
import { NotificationGateway } from "../notification/notification.gateway";
import { NotificationService } from "../notification/notification.service";
import { NotificationEntity } from "../notification/entity/notification.entity";
import { NotificationModule } from "../notification/notification.module";
@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, OtpEntity, NotificationEntity]),NotificationModule],
    controllers: [AuthController],
    providers: [JwtService,AuthService],
    exports: [JwtService, AuthService, TypeOrmModule]
})
export class AuthModule { }