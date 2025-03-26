import { BadRequestException, ConflictException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/sequelize";
import { InjectRepository } from "@nestjs/typeorm";
import { randomInt } from "crypto";
import { UserModel } from "../user/models/user.model";
import { CheckOtpDto, SendOtpDto } from "./dto/auth.dto";
import { OtpModel } from "./model/otp.model";
import { payloadType } from "./types/payload";

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(UserModel) private userModel: typeof UserModel,
        @InjectRepository(OtpModel) private otpModel: typeof OtpModel,
        private jwtService: JwtService,
    ) { }

    async sendOtp(sendOtpDto: SendOtpDto) {
        const { mobile } = sendOtpDto;
        let user = await this.userModel.findOne({ where: { mobile } })
        if (!user) {
            throw new UnauthorizedException('something went wrong')
        }
        const code = await this.createOtpForUser(user)
        return {
            statusCode: HttpStatus.OK,
            data: {
                message: "code send Successfully",
                code
            }
        }

    }

    async createOtpForUser(user: UserModel) {
        const expire_in: Date = new Date(new Date().getTime() + (1000 * 60 * 2));
        const code: string = randomInt(10000, 99999).toString();
        let otp = await this.otpModel.findOne({ where: { userId: user.id } });
        if (otp) {
            if (otp.expires_in > new Date()) {
                throw new BadRequestException("code not expired")
            }
            otp.code = code;
            otp.expires_in = expire_in;
        } else {
            otp = await this.otpModel.create({
                code: code,
                expires_in: expire_in,
                userId: user.id
            })
        }
        otp = await otp.save();
        user.otpId = otp.id;
        await user.save();
        return code
    }

    async checkOtp(checkOtpDto: CheckOtpDto) {
        const { mobile, code } = checkOtpDto;
        const user = await this.userModel.findOne({
            where: { mobile },
            include: {
                as: 'otp',
                model: OtpModel
            },
        })
        const now = new Date()
        if (!user || !user?.otp) throw new UnauthorizedException("create user or otp first");
        const otp = user?.otp;
        const expire_in = otp?.expires_in;
        if (otp?.code !== code) throw new UnauthorizedException("Code invalid")
        if (now > expire_in) throw new UnauthorizedException("Code expired")
        if (!user.verify_mobile) {
            await this.userModel.update({ verify_mobile: true }, { where: { mobile } })
        }
        const { accessToken, refreshToken } = this.generateTokenForUser({ id: user.id, mobile })
        return {
            statusCode: HttpStatus.OK,
            data: {
                accessToken,
                refreshToken,
                message: "logged in successfully"
            }
        }

    }

    generateTokenForUser(payload: payloadType) {
        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.ACCESS_TOKEN_SECRET,
            expiresIn: "30d"
        })
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.REFRESH_TOKEN_SECRET,
            expiresIn: "1y"
        })
        return {
            accessToken,
            refreshToken
        }
    }

    async validateToken(token: string) {
        try {
            const payload = this.jwtService.verify<payloadType>(token, {
                secret: process.env.ACCESS_TOKEN_SECRET
            })
            if (typeof payload === "object" && payload?.id) {
                const user = await this.userModel.findOne({ where: { id: payload.id } })
                if (!user) throw new UnauthorizedException("please login to your account")
                return {
                    mobile: user.mobile,
                    id: user.id
                }
            }
            throw new UnauthorizedException("please login to your account")
        } catch (error) {
            throw new UnauthorizedException("please login to your account")
        }

    }

    async checkMobile(mobile: string) {
        const user = await this.userModel.findOne({ where: { mobile } })
        if (user) throw new ConflictException("Mobile number is already exists")
    }
}