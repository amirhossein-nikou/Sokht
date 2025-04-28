import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsNumberString, Length } from "class-validator";
import { FuelTypes } from "src/common/enums/fuelType.enum";

export class CreateTankerDto {
    @ApiProperty()
    @IsNumberString()
    driverId: number;
    @ApiProperty()
    @IsNumberString()
    capacity: number;
    @ApiProperty({ enum: FuelTypes })
    @Transform(({ value }) => Number(value))
    @IsEnum(FuelTypes)
    fuel_type: FuelTypes;
    @ApiProperty()
    @IsNumberString()
    // @Length()
    number: number;
    @ApiProperty()
    @IsNumberString()
    depotId: number;
    @ApiPropertyOptional()
    @IsNumberString()
    cargoId: number;

}
