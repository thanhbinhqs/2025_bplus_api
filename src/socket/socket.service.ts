import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { User } from 'src/user/entities/user.entity';
import { DataSource, ArrayContains } from 'typeorm';

@Injectable()
export class SocketService {
  constructor(private readonly dbSource: DataSource) {}

  async handleClientConnection(client: Socket, io: Server) {
    const token = client.handshake.query['token'];
    if (token) {
      const user = await this.dbSource.manager.findOne(User, {
        where: {
          tokens: ArrayContains([token]),
        },
      });
      if (!user) return false;
      client.join(user.id);
      return true;
    }

    return false;
  }

//   handleClientDisconnection(client: Socket, io: Server) {
//     //find client in rooms and remove it from room
//     client.rooms.forEach((room) => {
//       client.leave(room);
//     });
//   }



  sendDataByUserId(userId: string, data: any, io: Server) {
    io.to(userId).emit('data', data);
    return true;
  }
}
