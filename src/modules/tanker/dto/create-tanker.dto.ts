import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsAlpha, IsNumberString, IsString, Length } from "class-validator";

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
    // plate
    @ApiProperty()
    @IsNumberString()
    @Length(2, 2)
    first: number;
    @ApiProperty()
    @IsNumberString()
    @Length(3, 3)
    second: number;
    @ApiProperty()
    @IsNumberString()
    @Length(2, 2)
    city: number;
    @ApiProperty()
    @IsAlpha("fa-IR",{message: 'char must contain only persian letters'})
    @Length(1, 1)
    char: string;
}
export class CreatePlateDto {
    @ApiProperty()
    @IsNumberString()
    @Length(2, 2)
    first: number;
    @ApiProperty()
    @IsNumberString()
    @Length(3, 3)
    second: number;
    @ApiProperty()
    @IsNumberString()
    @Length(2, 2)
    city: number;
    @ApiProperty()
    @IsAlpha("fa-IR",{message: 'char must contain only persian letters'})
    @Length(1, 1)
    char: string;
}
