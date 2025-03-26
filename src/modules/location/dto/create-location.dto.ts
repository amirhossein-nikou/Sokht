import { ApiProperty } from "@nestjs/swagger";
import { IsLatitude, IsLongitude, Length } from "class-validator";

export class CreateLocationDto {
    @ApiProperty()
    @IsLatitude()
    @Length(1, 30)
    lat: number;
    @ApiProperty()
    @IsLongitude()
    @Length(1, 30)
    lon: number;
}
