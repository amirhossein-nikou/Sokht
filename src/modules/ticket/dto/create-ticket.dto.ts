import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString, Length } from "class-validator";
import { TicketTargetEnum } from "../enum/target.enum";
import { TicketPriorityEnum } from "../enum/ticket-priority.enum";

export class CreateTicketDto {
    @ApiProperty()
    @IsString()
    @Length(3, 150)
    subject: string;
    @ApiProperty()
    @IsString()
    @Length(3, 150)
    title: string;
    @ApiProperty()
    @IsString()
    @Length(10, 300)
    content: string;
    @ApiProperty()
    @IsEnum(TicketTargetEnum)
    target: TicketTargetEnum
    @ApiProperty()
    @IsEnum(TicketPriorityEnum)
    priority: TicketPriorityEnum
}
