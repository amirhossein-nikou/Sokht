import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumberString, IsString } from "class-validator";
import { ReceiveTimeEnum } from "src/modules/request/enums/time.enum";

export class CreateCargoDto {
    @ApiProperty()
    @IsNumberString()
    requestId: number
    @ApiProperty()
    @IsNumberString()
    value: number;
    @ApiProperty({ enum: ReceiveTimeEnum })
    @IsString()
    @IsEnum(ReceiveTimeEnum)
    receive_at: ReceiveTimeEnum
    @ApiProperty({ type: 'array' })
    tankerId: number[]
}
