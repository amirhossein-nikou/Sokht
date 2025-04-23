import { ApiProperty } from "@nestjs/swagger";
import { IsNumberString } from "class-validator";

export class DashboardDto {
    @ApiProperty()
    @IsNumberString()
    inventoryId: number;
    @ApiProperty()
    @IsNumberString()
    cargoId: number;
}