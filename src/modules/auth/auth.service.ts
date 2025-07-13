import { ConflictException, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { randomInt } from "crypto";
import { ModifyMobileNumber } from "../../common/utils/mobile.utils";
import { Repository } from "typeorm";
import { UserEntity } from "../user/entity/user.entity";
import { CheckOtpDto, SendOtpDto } from "./dto/auth.dto";
import { OtpEntity } from "./entity/otp.entity";
import { payloadType } from "./types/payload";
import { NotificationGateway } from "../notification/notification.gateway";
import * as moment from 'moment-jalaali';
import { SendSms } from "src/common/utils/send-sms.utils";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
        @InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
        private jwtService: JwtService,
        private notification: NotificationGateway,
    ) { }

    async sendOtp(sendOtpDto: SendOtpDto) {
        try {
            console.info('access sendOtp');
            const { mobile } = sendOtpDto;
            let user = await this.userRepository.findOne({ where: { mobile: ModifyMobileNumber(mobile) } })
            if (!user) {
                throw new UnauthorizedException('something went wrong')
            }
            const code = await this.createOtpForUser(user)
            await SendSms({ args: [code], bodyId: 340999, to: user.mobile })
            return {
                statusCode: HttpStatus.OK,
                message: "code send Successfully",
            }
        } catch (error) {
            console.error(error.message);
            throw error
        }
    }

    async createOtpForUser(user: UserEntity) {
        const expire_in: Date = new Date(Date.now() + (1000 * 60 * 2));
        const code: string = randomInt(10000, 99999).toString();
        let otp = await this.otpRepository.findOne({ where: { userId: user.id } });
        if (otp) {
            if (otp.expires_in > new Date()) {
                throw new HttpException('code not expired', HttpStatus.OK);
            }
            otp.code = code;
            otp.expires_in = expire_in;
        } else {
            otp = this.otpRepository.create({
                code: code,
                expires_in: expire_in,
                userId: user.id
            })
        }
        otp = await this.otpRepository.save(otp);
        user.otpId = otp.id;
        await this.userRepository.save(user);
        return code
    }

    async checkOtp(checkOtpDto: CheckOtpDto) {
        try {
            console.log(`access  -> checkOtp`);
            const { mobile, code } = checkOtpDto;
            const user = await this.userRepository.findOne({
                where: { mobile: ModifyMobileNumber(mobile) },
                relations: {
                    otp: true
                },
            })
            const now = new Date()
            if (!user || !user?.otp) throw new UnauthorizedException("create user or otp first");
            const otp = user?.otp;
            const expire_in = otp?.expires_in;
            if (otp?.code !== code) throw new UnauthorizedException("Code invalid")
            if (now > expire_in) throw new UnauthorizedException("Code expired")
            if (!user.verify_mobile) {
                await this.userRepository.update({ id: user.id }, { verify_mobile: true })
            }
            const { accessToken, refreshToken } = this.generateTokenForUser({ id: user.id, mobile: ModifyMobileNumber(mobile) })
            await this.notification.notificationHandler({
                title: `پرسنل ${user.first_name} ${user.last_name} در ساعت ${moment(Date.now()).locale('fa').format('HH:mm')} و تاریخ ${moment(Date.now()).locale('fa').format('jYYYY-jMM-jDD')} وارد سیستم شد`,
                description: 'no description',
                userId: user.id,
                parentId: user.parentId ?? null
            })
            return {
                statusCode: HttpStatus.OK,
                data: {
                    accessToken,
                    refreshToken,
                    role: user.role,
                    isParent: !user.parentId
                },
                message: "logged in successfully"
            }
        } catch (error) {
            console.log(error.message);
            throw error
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
                const user = await this.userRepository.findOne({ where: { id: payload.id } })
                if (!user) throw new UnauthorizedException("please login to your account")
                return {
                    mobile: user.mobile,
                    id: user.id,
                    role: user.role,
                    parentId: user.parentId
                }
            }
            throw new UnauthorizedException("please login to your account")
        } catch (error) {
            throw new UnauthorizedException("please login to your account")
        }

    }

    async checkMobile(mobile: string) {
        const user = await this.userRepository.findOne({ where: { mobile } })
        if (user) throw new ConflictException("Mobile number is already exists")
    }
}