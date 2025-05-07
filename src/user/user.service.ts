import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FindAllUserDto } from './dto/find-all-user.dto';
import { REQUEST } from '@nestjs/core';
import { DataSource, In } from 'typeorm';
import { User } from './entities/user.entity';
import { Utils } from 'src/common/helpers/utils';
import { UserActionType } from 'src/common/enums/user-action.enum';
import { SubjectType } from 'src/common/enums/subject-type.enum';
import { UserResponseDto } from './dto/user-response.dto';
import { FindOneUserDto } from './dto/find-one-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { History } from 'src/history/entities/history.entity';
import { ChangeUserPasswordDto } from './dto/change-password.dto';
import { SetUserPasswordDto } from './dto/set-user-password.dto';
import { SetUserActiveDto } from './dto/set-user-active.dto';
import { SetUserRoleDto } from './dto/set-user-role.dto';
import { Role } from './entities/role.entity';
import {
  PermissionDto,
  SetUserPermissionDto,
} from './dto/set-user-permission.dto';
import { Permission } from './entities/permission.entity';
import { ActionType } from 'src/common/enums/action.enum';
import { get } from 'http';
import { Response } from 'express';
import { SetUserDepartmentDto } from './dto/set-user-department.dto';
import { Department } from './entities/department.entity';
import { SocketGateway } from 'src/socket/socket.gateway';
import { MenuService } from './menu.service';

@Injectable()
export class UserService {
  constructor(
    //add REQUEST
    @Inject(REQUEST)
    private readonly request: Request,
    private readonly dbSource: DataSource,
    private readonly socketGateway: SocketGateway,
    private readonly menuService: MenuService
  ) {}


  async me() {
    if (!this.request['user']) {
      throw new UnauthorizedException('Not authenticated');
    }
    return new UserResponseDto(this.request['user']);
  }

  async findAll(query: FindAllUserDto) {
    const { page = 1, limit = 50, order = 'ASC', search = '' } = query;
    const loggedUser: User = this.request['user'];

    const access = Utils.checkPermissions(
      loggedUser.permissions,
      Object.keys(UserActionType).map((key) => {
        return {
          subject: SubjectType.USER,
          action: UserActionType[key],
        };
      }),
    );
    if (!access)
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );

    const userRepository = this.dbSource.getRepository(User);
    const queryBuilder = userRepository.createQueryBuilder('user');
    queryBuilder.where('user.deleted = false');
    if (search) {
      queryBuilder.andWhere('user.username LIKE :search', {
        search: `%${search}%`,
      });
      //add search by email
      queryBuilder.orWhere('user.email LIKE :search', {
        search: `%${search}%`,
      });
      //add search by fullname
      queryBuilder.orWhere('user.fullname LIKE :search', {
        search: `%${search}%`,
      });
    }
    queryBuilder.orderBy('user.username', order);
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);
    const users = await queryBuilder.getManyAndCount();
    return {
      data: users[0].map((u) => new UserResponseDto(u)),
      total: !search ? users[1] : users[0].length,
      page: page,
      limit: limit,
    };
  }

  async findOne(param: FindOneUserDto) {
    //destructure id from param
    const { id } = param;
    //check permissions if user is logged in
    const loggedUser: User = this.request['user'];
    const access = Utils.checkPermissions(loggedUser.permissions, [
      {
        subject: SubjectType.USER,
        action: UserActionType.USER_LISTING,
      },
    ]);
    if (!access)
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );

    //repository
    const userRepository = this.dbSource.getRepository(User);
    //querybuilder
    const queryBuilder = userRepository.createQueryBuilder('user');
    queryBuilder.where('user.deleted = false');
    if (Utils.isValidUUID(id)) {
      queryBuilder.andWhere('user.id = :id', { id });
    } else {
      queryBuilder.andWhere('user.username = :id', { id });
    }
    const user = await queryBuilder.getOne();
    if (!user) throw new BadRequestException('User not found');

    return new UserResponseDto(user);
  }

  async delete(param: DeleteUserDto) {
    //destructure id from param
    const { id } = param;
    //const check = Utils.isValidUUID(id);
    //check permissions if user is logged in
    const loggedUser: User = this.request['user'];
    const access = Utils.checkPermissions(loggedUser.permissions, [
      {
        subject: SubjectType.USER,
        action: UserActionType.USER_DELETE,
      },
    ]);
    if (!access)
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );

    const user = await this.dbSource.manager.findOne(User, {
      where: { id, deleted: false },
    });
    if (!user) throw new BadRequestException('User not found');

    const history = new History();
    history.subject = SubjectType.USER;
    history.action = UserActionType.USER_DELETE;
    history.before = {
      deleted: user.deleted,
      id: user.id,
      username: user.username,
    };

    user.deleted = true;
    await this.dbSource.manager.save(user);

    history.after = {
      deleted: user.deleted,
      id: user.id,
      username: user.username,
    };
    history.userId = loggedUser.id;
    history.subjectId = user.id;
    await this.dbSource.manager.save(history);
    this.socketGateway.sendDataByUserId(user.id, {
      action: 'USER_DELETED',
    });

    return {
      id: user.id,
      username: user.username,
      message: 'User deleted successfully',
    };
  }

  async changePassword(body: ChangeUserPasswordDto, res: Response) {
    //destructure id from param
    const { password, oldPassword } = body;

    const loggedUser: User = this.request['user'];
    const user = await this.dbSource.manager.findOne(User, {
      where: { id: loggedUser.id, deleted: false },
    });
    if (!user) throw new BadRequestException('User not found');
    if (!Utils.comparePassword(oldPassword, user.password))
      throw new BadRequestException('Old password is incorrect');

    const history = new History();
    history.subject = SubjectType.USER;
    history.action = UserActionType.USER_CHANGE_PASSWORD;
    history.before = {
      password: user.password,
      id: user.id,
      username: user.username,
    };
    history.userId = loggedUser.id;
    history.subjectId = user.id;

    user.password = Utils.hashPassword(password);
    user.tokens = [];
    await this.dbSource.manager.save(user);
    history.after = {
      password: user.password,
      id: user.id,
      username: user.username,
    };
    await this.dbSource.manager.save(history);
    //clear cookie
    res.clearCookie('access-token', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });

    return {
      id: user.id,
      username: user.username,
      message: 'User password changed successfully',
    };
  }

  async setPassword(body: SetUserPasswordDto) {
    //destructure id from param
    const { id, password } = body;
    const loggedUser: User = this.request['user'];
    const access = Utils.checkPermissions(loggedUser.permissions, [
      {
        subject: SubjectType.USER,
        action: UserActionType.USER_SET_PASSWORD,
      },
    ]);
    if (!access)
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    const user = await this.dbSource.manager.findOne(User, {
      where: { id: id, deleted: false },
    });
    if (!user) throw new BadRequestException('User not found');

    const history = new History();
    history.subject = SubjectType.USER;
    history.action = UserActionType.USER_SET_PASSWORD;
    history.before = {
      password: user.password,
      id: user.id,
      username: user.username,
    };
    history.userId = loggedUser.id;
    history.subjectId = user.id;

    user.password = Utils.hashPassword(password);
    user.tokens = [];
    await this.dbSource.manager.save(user);
    history.after = {
      password: user.password,
      id: user.id,
      username: user.username,
    };
    await this.dbSource.manager.save(history);

    return {
      id: user.id,
      username: user.username,
      message: 'Set user password successfully',
    };
  }

  async setActive(body: SetUserActiveDto) {
    const { id, active } = body;

    const loggedUser: User = this.request['user'];
    const access = Utils.checkPermissions(loggedUser.permissions, [
      {
        subject: SubjectType.USER,
        action: UserActionType.USER_SET_ACTIVE,
      },
    ]);
    if (!access)
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    const user = await this.dbSource.manager.findOne(User, {
      where: { id: id, deleted: false },
    });
    if (!user) throw new BadRequestException('User not found');

    const history = new History();
    history.subject = SubjectType.USER;
    history.action = UserActionType.USER_SET_ACTIVE;
    history.before = {
      active: user.active,
      id: user.id,
      username: user.username,
    };
    history.userId = loggedUser.id;
    history.subjectId = user.id;

    user.active = active;
    user.tokens = [];
    await this.dbSource.manager.save(user);

    history.after = {
      active: user.active,
      id: user.id,
      username: user.username,
    };
    await this.dbSource.manager.save(history);

    return {
      id: user.id,
      username: user.username,
      message: 'Set user active successfully',
    };
  }

  async setUserRole(body: SetUserRoleDto) {
    const { id, roleId } = body;
    const loggedUser: User = this.request['user'];
    const access = Utils.checkPermissions(loggedUser.permissions, [
      {
        subject: SubjectType.USER,
        action: UserActionType.USER_SET_ROLE,
      },
    ]);
    if (!access)
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    const user = await this.dbSource.manager.findOne(User, {
      where: { id: id, deleted: false },
    });
    if (!user) throw new BadRequestException('User not found');

    //check role exists
    const role = await this.dbSource.manager.find(Role, {
      where: { id: In(roleId), deleted: false },
    });
    if (role.length != roleId.length)
      throw new BadRequestException('Some roles is invalid');

    const history = new History();
    history.subject = SubjectType.USER;
    history.action = UserActionType.USER_SET_ROLE;
    history.before = {
      role: user.roles,
      id: user.id,
      username: user.username,
    };
    history.userId = loggedUser.id;
    history.subjectId = user.id;

    user.roles = role;
    user.tokens = [];
    await this.dbSource.manager.save(user);

    history.after = {
      role: role,
      id: user.id,
      username: user.username,
    };
    await this.dbSource.manager.save(history);

    return {
      id: user.id,
      username: user.username,
      message: 'Set user role successfully',
    };
  }

  async setUserPermissions(body: SetUserPermissionDto) {
    const { id, permissions } = body;
    const loggedUser: User = this.request['user'];
    const access = Utils.checkPermissions(loggedUser.permissions, [
      {
        subject: SubjectType.USER,
        action: UserActionType.USER_SET_PERMISSIONS,
      },
    ]);
    if (!access)
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );

    let user = await this.dbSource.manager.findOne(User, {
      where: { id: id, deleted: false },
    });
    if (!user) throw new BadRequestException('User not found');

    //check permission valid or not
    const isValidPermissions = await Utils.isValidPermission(permissions);
    if (!isValidPermissions.valid) {
      throw new BadRequestException(
        isValidPermissions.message
          .map((n) => `${n.subject}, ${n.action}`)
          .join(';'),
      );
    }
    const dbPermissions = await this.dbSource.manager.save(
      Permission,
      permissions as any,
    );

    const history = new History();
    history.subject = SubjectType.USER;
    history.action = UserActionType.USER_SET_PERMISSIONS;
    history.before = {
      permission: user.permissions,
      id: user.id,
      username: user.username,
    };
    history.userId = loggedUser.id;
    history.subjectId = user.id;

    user.permissions = dbPermissions;
    user.tokens = [];
    user = await this.dbSource.manager.save(user);

    history.after = {
      permission: dbPermissions,
      id: user.id,
      username: user.username,
    };
    await this.dbSource.manager.save(history);

    return {
      id: user.id,
      username: user.username,
      message: 'Set user permissions successfully',
    };
  }

  async setUserDepartments(body: SetUserDepartmentDto) {
    const { id, departmentId } = body;
    const loggedUser: User = this.request['user'];
    const access = Utils.checkPermissions(loggedUser.permissions, [
      {
        subject: SubjectType.USER,
        action: UserActionType.USER_SET_DEPARTMENT,
      },
    ]);
    if (!access)
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    let user = await this.dbSource.manager.findOne(User, {
      where: { id: id, deleted: false },
    });
    if (!user) throw new BadRequestException('User not found');

    //check department exists
    const department = await this.dbSource.manager.find(Department, {
      where: { id: In(departmentId), deleted: false },
    });
    if (department.length != departmentId.length)
      throw new BadRequestException('Some departments is invalid');

    const history = new History();
    history.subject = SubjectType.USER;
    history.action = UserActionType.USER_SET_DEPARTMENT;
    history.before = {
      department: user.departments,
      id: user.id,
      username: user.username,
    };
    history.userId = loggedUser.id;
    history.subjectId = user.id;

    user.departments = department;

    user = await this.dbSource.manager.save(user);

    history.after = {
      department: department,
      id: user.id,
      username: user.username,
    };
    await this.dbSource.manager.save(history);

    return {
      id: user.id,
      username: user.username,
      message: 'Set user departments successfully',
    };
  }

  
  


}
