import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name: 'sockets'
})
export class SocketEntity extends BaseEntity {

    @Column()
    userId: string;

    @Column()
    socketId: string;
}
