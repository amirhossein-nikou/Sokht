import { ApiProperty } from '@nestjs/swagger';
import { IsMobilePhone, IsString } from 'class-validator';

export class UpdateMobileDto {
    @ApiProperty()
    @IsMobilePhone('fa-IR')
    mobile: string
}
export class UpdateMobileDtoAndroid{
    @ApiProperty()
    @IsMobilePhone('fa-IR')
    mobile: string
}
export class VerifyMobileDto {
    @ApiProperty()
    @IsMobilePhone('fa-IR')
    mobile: string
    @ApiProperty()
    @IsString()
    code: string
}
