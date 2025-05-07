import { BaseEntity } from 'src/common/entities/base.entity';
import { UserType } from 'src/common/enums/user-type.enum';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { Department } from './department.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  fullname?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  gen?: string;

  @Column({ nullable: true })
  birthday?: Date;

  @Column({ type: 'text', array: true, default: [] })
  tokens: string[];

  @Column({ default: UserType.PEOPLE })
  type: string;

  //create a relation with role entity with many to many relation
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({ name: 'user_roles' })
  roles: Role[];

  //create a relation with permission entity with many to many relation
  @OneToMany(() => Permission, (permission) => permission.users)
  permissions: Permission[];

  //create a relation with department entity with many to many relation
  @ManyToMany(() => Department, (department) => department.users)
  @JoinTable({ name: 'user_departments' })
  departments: Department[];

}
