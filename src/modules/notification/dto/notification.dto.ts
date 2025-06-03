import { PartialType } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateNotificationDto {
    @IsString()
    title: string
    @IsString()
    description: string
    @IsNumber()
    userId: number
    @IsNumber()
    parentId: number
}

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) { }