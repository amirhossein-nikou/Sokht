import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsBoolean, IsBooleanString, IsEnum, IsNumberString, IsString, Length } from "class-validator"
import { PartialType } from '@nestjs/swagger';
import { FuelTypes } from "src/common/enums/fuelType.enum";
import { Transform } from "class-transformer";
import { StringToArray } from "src/common/utils/stringToArray.utils";


export class CreateStationDto {
    @ApiProperty()
    @IsString()
    @Length(2, 50)
    name: string;
    @ApiProperty({ type: 'array' })
    fuel_types: number[]
    @ApiProperty({ type: 'boolean' })
    @IsBooleanString()
    isActive: boolean;
    @ApiProperty()
    @IsNumberString()
    @Length(1, 20)
    ownerId: number;
    @ApiProperty()
    @IsNumberString()
    @Length(1, 20)
    locationId: number;
}
export class UpdateStationDto extends PartialType(CreateStationDto) { }