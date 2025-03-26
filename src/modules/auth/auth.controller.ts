import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CheckOtpDto, SendOtpDto } from "./dto/auth.dto";
import { ApiConsumes } from "@nestjs/swagger";
import { SwaggerConsumes } from "src/common/enums/swagger-consumes.enum";

@Controller("/auth")
export class AuthController{
    constructor(private readonly authService: AuthService){}
    @Post("/send-otp")
    @ApiConsumes(SwaggerConsumes.UrlEncoded)
    sendOtp(@Body() sendOtpDto : SendOtpDto){
        return this.authService.sendOtp(sendOtpDto)
    }
    @Post("/check-otp")
    @ApiConsumes(SwaggerConsumes.UrlEncoded)
    checkOtp(@Body() checkOtpDto: CheckOtpDto){
        return this.authService.checkOtp(checkOtpDto);
    }
    
}