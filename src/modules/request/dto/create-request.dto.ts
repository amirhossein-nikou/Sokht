import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumberString, IsString } from "class-validator";
import { FuelTypes } from "src/common/enums/fuelType.enum";
import { ReceiveTimeEnum } from "../enums/time.enum";

export class CreateRequestDto {
    @ApiProperty()
    @IsNumberString()
    stationId: number;
    @ApiProperty({ enum: FuelTypes })
    @IsString()
    @IsEnum(FuelTypes)
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
