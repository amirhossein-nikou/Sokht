import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsBooleanString, IsNumberString, IsString, Length } from "class-validator";


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