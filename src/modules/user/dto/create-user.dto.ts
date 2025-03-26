import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEmpty, IsEnum, IsIdentityCard, IsMobilePhone, IsNumberString, IsOptional, IsString, Length } from "class-validator"
import { UserRole } from "../enum/role.enum"

export class CreateUserDto {
    @ApiProperty()
    @IsString()
    @Length(2, 50)
    first_name: string
    @ApiProperty()
    @IsString()
    @Length(2, 50)
    last_name: string
    @ApiProperty()
    @IsMobilePhone('fa-IR')
    mobile: string
    @ApiProperty()
    @IsString()
    @Length(10, 10)
    @IsIdentityCard('IR')
    national_code: string
    @ApiProperty({ enum: UserRole })
    @IsEnum(UserRole)
    role: UserRole
    @ApiPropertyOptional()
    @IsNumberString()
    @IsOptional()
    @Length(2, 6)
    certificateId: number
}
export class AddSubUserDto {
    @ApiProperty()
    @IsString()
    @Length(2, 50)
    first_name: string
    @ApiProperty()
    @IsString()
    @Length(2, 50)
    last_name: string
    @ApiProperty()
    @IsMobilePhone('fa-IR')
    mobile: string
    @ApiProperty()
    @IsString()
    @Length(10, 10)
    national_code: string
    @ApiPropertyOptional()
    @IsNumberString()
    @IsOptional()
    @Length(2, 6)
    certificateId: number
}
