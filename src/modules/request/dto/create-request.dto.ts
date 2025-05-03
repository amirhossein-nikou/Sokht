import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumberString, IsString } from "class-validator";
import { ReceiveTimeEnum } from "../enums/time.enum";

export class CreateRequestDto {
    @ApiProperty()
    @IsNumberString()
    stationId: number;
    @ApiProperty()
    @IsNumberString()
    fuel_type: number
    @ApiProperty()
    @IsNumberString()
    value: number;
    @ApiProperty()
    @IsNumberString()
    depotId: number;
    @ApiProperty({ enum: ReceiveTimeEnum })
    @IsString()
    @IsEnum(ReceiveTimeEnum)
    receive_at: ReceiveTimeEnum
}
