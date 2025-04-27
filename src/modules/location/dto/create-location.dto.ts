import { ApiProperty } from "@nestjs/swagger";
import { IsLatitude, IsLongitude, IsString, Length } from "class-validator";

export class CreateLocationDto {
    @ApiProperty()
    @IsLatitude()
    @Length(1, 30)
    lat: number;
    @ApiProperty()
    @IsString()
    address: string;
    @ApiProperty()
    @IsLongitude()
    @Length(1, 30)
    lon: number;
}
