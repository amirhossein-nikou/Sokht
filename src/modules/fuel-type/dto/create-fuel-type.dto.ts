import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateFuelTypeDto {
    @ApiProperty()
    @IsString()
    name: string
}
