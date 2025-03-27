import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsEnum, IsNumberString } from "class-validator";
import { FuelTypes } from "src/common/enums/fuelType.enum";

export class CreateSaleDto {
    @ApiProperty()
    @IsNumberString()
    monthly_average_sale: number;
    @ApiProperty({enum: FuelTypes})
    @IsEnum(FuelTypes)
    fuel_type: FuelTypes;
    @ApiProperty()
    @IsNumberString()
    stationId: number
}
export class UpdateSaleDto extends PartialType(CreateSaleDto) {}