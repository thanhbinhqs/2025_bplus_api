import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { User } from "./user.entity";
import { Permission } from "./permission.entity";

@Entity({ name: 'roles' })
export class Role extends BaseEntity {

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    description?: string;

    //create relation with user entity with many to many relation
    @ManyToMany(() => User, (user) => user.roles)
    users: User[];

    //create a relation with permission entity with many to many relation
    @OneToMany(() => Permission, (permission) => permission.roles)
    permissions: Permission[];
}