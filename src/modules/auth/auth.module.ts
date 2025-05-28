import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../user/entity/user.entity";
import { OtpEntity } from "./entity/otp.entity";
import { NotificationGateway } from "../socket/notification.gateway";
@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, OtpEntity])],
    controllers: [AuthController],
    providers: [AuthService, JwtService,NotificationGateway],
    exports: [JwtService, AuthService, TypeOrmModule]
})
export class AuthModule { }