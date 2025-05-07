import { RoleService } from './role.service';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PermissionController } from './permission.controller';
import { RoleController } from './role.controller';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { SocketGateway } from 'src/socket/socket.gateway';
import { SocketService } from 'src/socket/socket.service';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';

@Module({
  controllers: [
    UserController,
    PermissionController,
    RoleController,
    DepartmentController,
    MenuController
  ],
  providers: [UserService, RoleService, DepartmentService, SocketGateway, SocketService, MenuService],

  imports: [],
})
export class UserModule {}
