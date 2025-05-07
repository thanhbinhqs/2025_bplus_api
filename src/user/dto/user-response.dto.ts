import { User } from "../entities/user.entity";

export class UserResponseDto {
  id: string;
  username: string;
  fullname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  gen?: string;
  birthday?: Date;
  address?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: User){
    this.id = user.id;
    this.username = user.username;
    this.fullname = user.fullname;
    this.email = user.email;
    this.phone = user.phone;
    this.avatar = user.avatar;
    this.gen = user.gen;
    this.birthday = user.birthday;
    this.address = user.address;
    this.active = user.active;
    this.createdAt = user.created_at;
    this.updatedAt = user.updated_at;
  }
}
