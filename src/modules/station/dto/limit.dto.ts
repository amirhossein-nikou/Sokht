import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDate, IsNumber, IsNumberString, IsOptional } from "class-validator";

export class LimitDto{
    @ApiProperty()
    @IsNumberString()
    value:number;
    @ApiPropertyOptional({type: 'integer'})
    @IsDate()
    @IsOptional()
    date?:Date;
    @IsNumberString()
    @ApiProperty()
    stationId:number;
}