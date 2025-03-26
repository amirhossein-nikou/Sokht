import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsEnum, IsNumberString } from "class-validator";
import { FuelTypes } from "src/common/enums/fuelType.enum";

export class CreateInventoryDto {
    @ApiProperty()
    @IsNumberString({no_symbols: true})
    value: number;
    @ApiProperty({ enum: FuelTypes })
    @IsEnum(FuelTypes)
    fuel_type: FuelTypes;
}
export class UpdateInventoryDto extends PartialType(CreateInventoryDto) { }