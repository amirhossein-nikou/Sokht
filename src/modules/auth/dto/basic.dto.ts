import { IsEmail, IsString, Length } from "class-validator";


export class LoginDto {
    @IsString()
    @IsEmail({},{message: "invalid email format"})
    email: string
    @IsString()
    @Length(8,30,{message: "password most have more than 8 and less than 30 character"})
    password: string
}