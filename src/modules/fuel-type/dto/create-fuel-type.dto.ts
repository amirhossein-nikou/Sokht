import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";

export class CreateFuelTypeDto {
    @IsString()
    name: string
    @IsNumber()
    id: number
    @IsArray()
    available_value: number[]
}
