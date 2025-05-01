import { ApiProperty, ApiPropertyOptional, PartialType, PickType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsNumberString, IsString } from "class-validator";
import { FuelTypes } from "src/common/enums/fuelType.enum";

export class CreateInventoryDto {
    @ApiProperty()
    @IsString()
    name: string;
    @ApiPropertyOptional()
    @IsNumberString({ no_symbols: true })
    value: number;
    @ApiProperty()
    @IsNumberString({ no_symbols: true })
    max: number;
    @ApiProperty()
    @IsNumberString()
    fuel_type: number;
    @ApiProperty()
    @IsNumberString()
    stationId: number
}
export class UpdateValue {
    @ApiProperty()
    @IsNumberString({ no_symbols: true })
    value: number;
}
export class UpdateInventoryDto extends PartialType(PickType(CreateInventoryDto,
    ['max','name','stationId',"value"]
)) { }