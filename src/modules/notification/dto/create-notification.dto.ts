import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class NotificationDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    token: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    title: string;
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    body: string;
    @ApiPropertyOptional({ type: String, description: "Notification Icon / Logo" })
    @IsOptional()
    @IsString()
    icon: string;
}
export class MultipleDeviceNotificationDto extends PickType(NotificationDto, ["title","body","icon",]) {
    @ApiProperty({ type: String, description: "Clients device token", })
    @IsArray()
    tokens: string[];
}
export class TopicNotificationDto extends PickType(NotificationDto, ["title","body","icon"]) {
    @ApiProperty({type: String,description: "Subscription topic to send to"})
    topic: string;
}