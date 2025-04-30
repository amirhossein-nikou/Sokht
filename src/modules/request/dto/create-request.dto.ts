import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsNumberString, IsString } from "class-validator";
import { FuelTypes } from "src/common/enums/fuelType.enum";
import { ReceiveTimeEnum } from "../enums/time.enum";
import { Transform } from "class-transformer";

export class CreateRequestDto {
    @ApiProperty()
    @IsNumberString()
    stationId: number;
    @ApiProperty({ enum: FuelTypes })
    @IsNumber()
    @Transform(({ value }) => Number(value))
    fuel_type: FuelTypes
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
