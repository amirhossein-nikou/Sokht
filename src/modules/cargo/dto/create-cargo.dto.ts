import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsDateString, IsNumberString } from "class-validator";

export class CreateCargoDto {
    @ApiProperty()
    @IsNumberString()
    requestId: number
    @ApiProperty()
    @IsDateString()
    dispatch_time: Date;
    @ApiProperty()
    @IsDateString()
    arrival_time: Date;
}
