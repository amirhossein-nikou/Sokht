import { ApiProperty, PartialType } from '@nestjs/swagger';
import {  IsNumber, IsNumberString, IsString } from 'class-validator';
export class CreateDepotDto {
    @ApiProperty()
    @IsString()
    name: string
    @ApiProperty()
    @IsNumberString()
    ownerId: number
    @ApiProperty()
    @IsNumberString()
    locationId: number
}

export class UpdateDepotDto extends PartialType(CreateDepotDto) {}
