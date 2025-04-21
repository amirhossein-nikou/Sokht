import { IsDateString } from "class-validator";

export class SearchDto {
    @IsDateString()
    start: Date
    @IsDateString()
    end: Date
}