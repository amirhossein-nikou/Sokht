import { IsDateString, IsEnum, IsNumberString, IsOptional } from "class-validator";
import { ReceiveTimeEnum } from "../enums/time.enum";

export class SearchDto {
    @IsNumberString()
    @IsOptional()
    fuel_type?: number
    @IsDateString()
    start: Date
    @IsDateString()
    @IsOptional()
    end?: Date
}
export class SearchWithFuelAndReceiveDto {
    @IsNumberString()
    fuel_type: number
    @IsOptional()
    @IsEnum(ReceiveTimeEnum)
    receive_at?: ReceiveTimeEnum
}
