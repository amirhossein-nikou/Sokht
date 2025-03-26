import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { UserModel } from "../user/models/user.model";
import { OtpModel } from "./model/otp.model";
import { SequelizeModule } from "@nestjs/sequelize";

@Module({
    imports: [SequelizeModule.forFeature([UserModel, OtpModel])],
    controllers: [AuthController],
    providers: [AuthService, JwtService],
    exports: [JwtService, AuthService, SequelizeModule]
})
export class AuthModule { }