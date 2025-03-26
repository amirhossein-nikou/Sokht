import { ApiProperty } from "@nestjs/swagger";
import { IsMobilePhone, IsString, Length } from "class-validator";


export class SendOtpDto{
    @ApiProperty()
    @IsMobilePhone("fa-IR",{},{message:"invalid mobile number"})
    mobile: string
}

export class CheckOtpDto{
    @ApiProperty()
    @IsMobilePhone("fa-IR",{},{message:"invalid mobile number"})
    mobile: string;
    @ApiProperty()
    @IsString()
    @Length(5,5,{message: "invalid code (length or type)"})
    code: string;
}