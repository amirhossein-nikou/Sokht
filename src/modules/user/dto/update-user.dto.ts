import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsMobilePhone, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateMobileDto {
    @ApiProperty()
    @IsMobilePhone('fa-IR')
    mobile: string
}
export class UpdateMobileDtoAndroid {
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
export class UpdateUserDto extends PartialType(PickType(CreateUserDto,
    ['last_name', 'first_name', 'mobile', 'national_code', 'certificateId','position']
)) { }
