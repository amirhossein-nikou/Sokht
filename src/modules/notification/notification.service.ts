import { HttpStatus, Injectable } from '@nestjs/common';
import { MultipleDeviceNotificationDto, NotificationDto, TopicNotificationDto } from './dto/create-notification.dto';
import * as admin from "firebase-admin";
@Injectable()
export class NotificationService {

    async singleAndroid(notificationDto: NotificationDto) {
        try {
            const { body, icon, title, token } = notificationDto
            const response = await admin.messaging().send({
                token,
                android: {
                    priority: 'high',
                    notification: {
                        title,
                        body,
                        icon
                    }
                }
            })
            console.log("Successfully sent message: ", response);
            return {
                statusCode: HttpStatus.OK,
                data: {
                    success: true, message: "Notification notification sent successfully"
                }
            };
        } catch (error) {
            console.log("failed sent message: ", error);
            return { success: false, message: "Failed to send notifications" };
        }
    }
    async multiAndroid(multipleNotificationDto: MultipleDeviceNotificationDto) {
        try {
            const { title, body, icon, tokens } = multipleNotificationDto
            const response = await admin.messaging().sendEachForMulticast({
                android: {
                    priority: "normal",
                    notification: {
                        title,
                        body,
                        icon,
                    },
                },
                tokens,
            });
            console.log("Successfully sent messages:", response);
            return {
                statusCode: HttpStatus.OK,
                data: {
                    success: true, message: "Multiple notification sent successfully"
                }
            };
        } catch (error) {
            console.log("Error sending messages:", error);
            return { success: false, message: "Failed to send notifications" };
        }
    }
    async sendTopicAndroid(topicNotificationDto: TopicNotificationDto) {
        try {
            const { body, icon, title, topic } = topicNotificationDto
            const response = await admin.messaging().send({
                topic,
                android: {
                    priority: "high",
                    notification: {
                        body, icon, title,
                    }
                }
            });
            console.log("Successfully sent message:", response);
            return {
                statusCode: HttpStatus.OK,
                data: {
                    success: true, message: "Topic notification sent successfully"
                }
            };
        } catch (error) {
            console.log("Error sending message:", error);
            return { success: false, message: "Failed to send topic notification" };

        }
    }

    // web
    async singleWeb(notificationDto: NotificationDto) {
        try {
            const { body, icon, title, token } = notificationDto
            const response = await admin.messaging().send({
                token,
                webpush: {
                    notification: {
                        title,
                        body,
                        icon
                    }
                }
            })
            console.log("Successfully sent message: ", response);
            return {
                statusCode: HttpStatus.OK,
                data: {
                    success: true, message: "Notification notification sent successfully"
                }
            };
        } catch (error) {
            console.log("failed sent message: ", error);
            return { success: false, message: "Failed to send notifications" };
        }
    }
    async multiWeb(multipleNotificationDto: MultipleDeviceNotificationDto) {
        try {
            const { title, body, icon, tokens } = multipleNotificationDto
            const response = await admin.messaging().sendEachForMulticast({
                webpush: {
                    notification: {
                        title,
                        body,
                        icon,
                    },
                },
                tokens,
            });
            console.log("Successfully sent messages:", response);
            return {
                statusCode: HttpStatus.OK,
                data: {
                    success: true, message: "Multiple notification sent successfully"
                }
            };
        } catch (error) {
            console.log("Error sending messages:", error);
            return { success: false, message: "Failed to send notifications" };
        }
    }
    async sendTopicWeb(topicNotificationDto: TopicNotificationDto) {
        try {
            const { body, icon, title, topic } = topicNotificationDto
            const response = await admin.messaging().send({
                topic,
                webpush: {
                    notification: {
                        body, icon, title,
                    }
                }
            });
            console.log("Successfully sent message:", response);
            return {
                statusCode: HttpStatus.OK,
                data: {
                    success: true, message: "Topic notification sent successfully"
                }
            };
        } catch (error) {
            console.log("Error sending message:", error);
            return { success: false, message: "Failed to send topic notification" };

        }
    }
    
}
