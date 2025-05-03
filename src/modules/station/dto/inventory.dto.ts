import { ApiProperty, ApiPropertyOptional, PartialType, PickType } from "@nestjs/swagger";
import { IsNumberString, IsString } from "class-validator";

export class CreateInventoryDto {
    @ApiProperty()
    @IsString()
    name: string;
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
    ['max','name','stationId']
)) { }