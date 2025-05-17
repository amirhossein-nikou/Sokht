import { IsDateString, IsEnum, IsNumberString, IsOptional } from "class-validator";
import { ReceiveTimeEnum } from "../enums/time.enum";

export class SearchDto {
    @IsDateString()
    start: Date
    @IsDateString()
    end: Date
}
export class SearchWithFuelAndReceiveDto {
    @IsNumberString()
    fuel_type: Date
    @IsOptional()
    @IsEnum(ReceiveTimeEnum)
    receive_at?: ReceiveTimeEnum
}
