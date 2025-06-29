import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreatePlateDto, CreateTankerDto } from './create-tanker.dto';
import { IsNumberString } from 'class-validator';

export class UpdateTankerDto {
    @ApiPropertyOptional()
    @IsNumberString()
    capacity: number;
    @ApiPropertyOptional()
    @IsNumberString()
    // @Length()
    number: number;
    @ApiPropertyOptional()
    @IsNumberString()
    driverId: number;
}

export class UpdatePlateDto extends PartialType(CreatePlateDto) { }
