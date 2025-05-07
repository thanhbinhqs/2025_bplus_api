import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketServer,
} from '@nestjs/websockets';
import { SocketService } from './socket.service';
import { CreateSocketDto } from './dto/create-socket.dto';
import { UpdateSocketDto } from './dto/update-socket.dto';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(0, {})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(SocketGateway.name);
  @WebSocketServer() io: Server;

  constructor(private readonly socketService: SocketService) {}

  afterInit(server: any) {
    this.logger.log('WebSocket server initialized');
  }
  async handleConnection(client: Socket, ...args: any[]) {
   var result = await this.socketService.handleClientConnection(client, this.io);
   if(!result) client.disconnect();
   this.logger.log(`Socket Cliend id:${client.id} connected`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Cliend id:${client.id} disconnected`);
  }

  @SubscribeMessage('ping')
  handleMessage(client: any, data: any) {
    this.logger.log(`Message received from client id: ${client.id}`);
    this.logger.debug(`Payload: ${data}`);
    return {
      event: 'pang',
      data: 'Wrong data that will make the test fail',
    };
  }

  @SubscribeMessage('data')
  handleEvent(@MessageBody() data: any): {
    success: boolean;
    data: any;
    message: string | string[];
  } {
    return data;
  }

  async sendDataByUserId(userId: string, data: any) {
    await this.socketService.sendDataByUserId(userId, data, this.io);
  }
}
