import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'departments' })
export class Department extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  //relation with user entity
  @ManyToMany(() => User, (user) => user.departments)
  users: User[];

  // Relation for parent department
  @ManyToOne(() => Department, (department) => department.children, {
    nullable: true,
  })
  parent?: Department;

  // Relation for child departments
  @OneToMany(() => Department, (department) => department.parent)
  children: Department[];
}
