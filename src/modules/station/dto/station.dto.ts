import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean, IsBooleanString, IsNumberString, IsString, Length } from "class-validator"
import { PartialType } from '@nestjs/swagger';


export class CreateStationDto {
    @ApiProperty()
    @IsString()
    @Length(2, 50)
    name: string;
    @ApiProperty({type: 'boolean'})
    @IsBooleanString()
    isActive: boolean;
    @ApiProperty()
    @IsNumberString()
    @Length(1,20)
    ownerId: number;
    @ApiProperty()
    @IsNumberString()
    @Length(1,20)
    locationId: number;
}
export class UpdateStationDto extends PartialType(CreateStationDto) {}