import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotificationService } from './notification.service';
import {  MultipleDeviceNotificationDto, NotificationDto, TopicNotificationDto } from './dto/create-notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post("/android/single")
  sendNotification(@Body() notificationDto: NotificationDto) {
    return this.notificationService.singleAndroid(notificationDto);
  }
  @Post('/android/multiple')
  sendMultipleNotification(@Body() multipleDeviceNotificationDto: MultipleDeviceNotificationDto) {
    return this.notificationService.multiAndroid(multipleDeviceNotificationDto);
  }
  @Post('/android/topic')
  sendTopicWeb(@Body() topicNotificationDto: TopicNotificationDto) {
    return this.notificationService.sendTopicWeb(topicNotificationDto);
  }
  //web
  @Post("/web/single")
  sendNotificationWeb(@Body() notificationDto: NotificationDto) {
    return this.notificationService.singleWeb(notificationDto);
  }
  @Post('/web/multiple')
  sendMultipleNotificationWeb(@Body() multipleDeviceNotificationDto: MultipleDeviceNotificationDto) {
    return this.notificationService.multiWeb(multipleDeviceNotificationDto);
  }
  @Post('/web/topic')
  sendTopic(@Body() topicNotificationDto: TopicNotificationDto) {
    return this.notificationService.sendTopicAndroid(topicNotificationDto);
  }


}
