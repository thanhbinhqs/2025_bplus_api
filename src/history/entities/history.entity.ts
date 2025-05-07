//create a history entity to store histories of all entities
import { BaseEntity } from 'src/common/entities/base.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'histories' })
export class History {
  @PrimaryGeneratedColumn('uuid')
  id: string; // unique identifier for the history record

  @Column()
  subject: string; // name of the entity (e.g., User, Role, Permission, Department)

  @Column()
  action: string; // action performed (e.g., create, update, delete)

  @Column({ default: 'ABCDEFGH' })
  subjectId: string; // ID of the subject (e.g., user ID, role ID, etc.)

  @Column({ type: 'jsonb', nullable: true })
  before?: any; // data related to the action (e.g., old value, new value)

  @Column({ type: 'jsonb', nullable: true })
  after?: any; // data related to the action (e.g., old value, new value)
  
  @Column({ nullable: true })
  userId?: string; // ID of the user who performed the action

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date; // timestamp of when the action was performed
}
