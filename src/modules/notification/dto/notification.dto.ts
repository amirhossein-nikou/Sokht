import { PartialType } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateNotificationDto {
    @IsString()
    title: string
    @IsString()
    description: string
    @IsNumber()
    userId: number
}

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) { }