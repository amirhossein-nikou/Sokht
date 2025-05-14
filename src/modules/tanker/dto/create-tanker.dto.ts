import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsString } from "class-validator";

export class CreateTankerDto {
    @ApiProperty()
    @IsNumberString()
    driverId: number;
    @ApiProperty()
    @IsNumberString()
    capacity: number;
    @ApiProperty()
    @IsNumberString()
    // @Length()
    number: number;
    @ApiProperty()
    @IsString()
    plate: string;
}
