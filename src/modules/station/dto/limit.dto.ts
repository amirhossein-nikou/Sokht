import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsDateString, IsNumber, IsNumberString, IsOptional } from "class-validator";

export class LimitDto{
    @ApiProperty()
    @IsNumberString()
    value:number;
    @ApiPropertyOptional()
    @IsDateString()
    @IsOptional()
    date?:Date;
    @IsNumberString()
    @ApiProperty()
    stationId:number;
    
    by_user: boolean
}