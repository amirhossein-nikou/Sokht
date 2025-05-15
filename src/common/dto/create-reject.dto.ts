import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { RejectTitleEnum } from "../enums/reject-title.enum";

export class RejectDto {
    @ApiProperty()
    @IsEnum(RejectTitleEnum)
    @IsString()
    title: RejectTitleEnum
    @ApiProperty()
    @IsString()
    description: string
}
