import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role.entity";
import { User } from "./user.entity";

@Entity({ name: 'permissions' })
export class Permission  {

    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column()
    subject: string;

    @Column()
    action: string;

    @Column({nullable: true})
    attributes?: string;

    //create expiration date for permission with default value is 9999-12-31
    @Column({type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP + INTERVAL \'1000 years\'',})
    expirationDate: Date;

    //create relation with role entity with many to many relation
    @ManyToOne(() => Role, (role) => role.permissions)
    roles: Role[];

    //create relation with user entity with many to many relation
    @ManyToOne(() => User, (user) => user.permissions)
    users: User[];

    @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at: Date;
}