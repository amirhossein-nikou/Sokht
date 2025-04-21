import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNumberString, IsString } from "class-validator";
import { ReceiveTimeEnum } from "../enums/time.enum";

export class UpdateRequestDto{
    @ApiPropertyOptional()
    @IsNumberString()
    value: number;
    @ApiPropertyOptional({ enum: ReceiveTimeEnum })
    @IsString()
    @IsEnum(ReceiveTimeEnum)
    receive_at: ReceiveTimeEnum
}
