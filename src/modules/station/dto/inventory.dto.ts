import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsEnum, IsNumberString, IsString } from "class-validator";
import { FuelTypes } from "src/common/enums/fuelType.enum";

export class CreateInventoryDto {
    @ApiProperty()
    @IsString()
    name: string;
    @ApiProperty()
    @IsNumberString({no_symbols: true})
    value: number;
    @ApiProperty()
    @IsNumberString({no_symbols: true})
    max: number;
    @ApiProperty({ enum: FuelTypes })
    @IsEnum(FuelTypes)
    fuel_type: FuelTypes;
    @ApiProperty()
    @IsNumberString()
    stationId: number
}
export class UpdateValue {
    @ApiProperty()
    @IsNumberString({no_symbols: true})
    value: number;
}
export class UpdateInventoryDto extends PartialType(CreateInventoryDto) { }