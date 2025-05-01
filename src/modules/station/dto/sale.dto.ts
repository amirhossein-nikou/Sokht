import { ApiProperty, PartialType, PickType } from "@nestjs/swagger";
import { IsNumberString } from "class-validator";

export class CreateSaleDto {
    @ApiProperty()
    @IsNumberString()
    average_sale: number;
    @ApiProperty()
    @IsNumberString()
    fuel_type: number;
    @ApiProperty()
    @IsNumberString()
    stationId: number
}
export class UpdateSaleDto extends PartialType(PickType(CreateSaleDto,['stationId','average_sale'])) {}