import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { FindAllRoleDto } from './dto/find-all-role.dto';
import { User } from './entities/user.entity';
import { Utils } from 'src/common/helpers/utils';
import { SubjectType } from 'src/common/enums/subject-type.enum';
import { ActionType } from 'src/common/enums/action.enum';
import { UserActionType } from 'src/common/enums/user-action.enum';
import { Role } from './entities/role.entity';
import { FindOneRoleDto } from './dto/find-one-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { History } from 'src/history/entities/history.entity';
import { DeleteRoleDto } from './dto/delete-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { Permission } from './entities/permission.entity';

@Injectable()
export class RoleService {
  constructor(
    //add REQUEST
    @Inject(REQUEST)
    private readonly request: Request,
    private readonly dbSource: DataSource,
  ) {}

  async create(body: CreateRoleDto) {
    const { name, description, permissions } = body;
    const loggedUser: User = this.request['user'];
    const access = Utils.checkPermissions(loggedUser.permissions, [
      {
        subject: SubjectType.ROLE,
        action: ActionType.CREATE,
      },
    ]);
    if (!access)
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    if (permissions && permissions.length > 0) {
      const isValidPermissions = Utils.isValidPermission(permissions);
      if (!isValidPermissions.valid)
        throw new BadRequestException(
          isValidPermissions.message
            .map((n) => `${n.subject}, ${n.action}`)
            .join(';'),
        );
    }

    const dbRole = await this.dbSource.manager.findOne(Role, {
      where: { name },
    });
    if (dbRole) throw new BadRequestException('Role already exists.');

    const dbPermissions = await this.dbSource.manager.save(
      Permission,
      permissions as any,
    );

    const role = new Role();
    role.name = name;
    role.description = description;
    role.permissions = dbPermissions;
    await this.dbSource.manager.save(role);

    //create history
    const history = new History();
    history.action = ActionType.CREATE;
    history.subject = SubjectType.ROLE;
    history.userId = loggedUser.id;
    history.subjectId = role.id;
    history.after = {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    };
    await this.dbSource.manager.save(history);

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      message: 'Role created successfully.',
    };
  }

  async findAll(query: FindAllRoleDto) {
    const { page = 1, limit = 50, search = '' } = query;
    const loggedUser: User = this.request['user'];
    const access = Utils.checkPermissions(loggedUser.permissions, [
      ...Object.keys(ActionType).map((key) => {
        return {
          action: ActionType[key],
          subject: SubjectType.ROLE,
        };
      }),
      {
        subject: SubjectType.USER,
        action: UserActionType.USER_SET_ROLE,
      },
      {
        subject: SubjectType.USER,
        action: UserActionType.USER_SET_ROLE_PERMISSIONS,
      },
    ]);

    if (!access)
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    const repository = this.dbSource.getRepository(Role);
    const queryBuilder = repository.createQueryBuilder('role');
    queryBuilder.where('role.deleted = :deleted', { deleted: false });
    if (search) {
      queryBuilder.andWhere('role.name LIKE :name', { name: `%${search}%` });
    }
    queryBuilder.orderBy('role.name', 'DESC');
    queryBuilder.skip((page - 1) * limit).take(limit);
    const [result, total] = await queryBuilder.getManyAndCount();

    return {
      data: result,
      total: !search ? total : result.length,
      page: page,
      limit: limit,
    };
  }

  async findOne(param: FindOneRoleDto) {
    const { id } = param;
    const loggedUser: User = this.request['user'];
    const access = Utils.checkPermissions(loggedUser.permissions, [
      ...Object.keys(ActionType).map((key) => {
        return {
          action: ActionType[key],
          subject: SubjectType.ROLE,
        };
      }),
      {
        subject: SubjectType.USER,
        action: UserActionType.USER_SET_ROLE,
      },
      {
        subject: SubjectType.USER,
        action: UserActionType.USER_SET_ROLE_PERMISSIONS,
      },
    ]);
    if (!access)
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );

    const repository = this.dbSource.getRepository(Role);
    const queryBuilder = repository.createQueryBuilder('role');
    queryBuilder.where('role.deleted = :deleted', { deleted: false });
    if (Utils.isValidUUID(id)) {
      queryBuilder.andWhere('role.id = :id', { id });
    } else {
      queryBuilder.andWhere('role.name = :name', { name: id });
    }
    const role = await queryBuilder.getOne();
    if (!role) throw new ForbiddenException('Role not found.');
    return role;
  }

  async update(body: UpdateRoleDto) {
    const { id, name, description, permissions } = body;
    const loggedUser: User = this.request['user'];
    const access = Utils.checkPermissions(loggedUser.permissions, [
      {
        subject: SubjectType.ROLE,
        action: ActionType.UPDATE,
      },
    ]);
    if (!access)
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    let role = await this.dbSource.manager.findOne(Role, {
      where: { id, deleted: false },
    });
    if (!role) throw new ForbiddenException('Role not found.');

    const roleByName = await this.dbSource.manager.findOne(Role, {
      where: { name },
    });

    if (roleByName && roleByName.id !== role.id)
      throw new BadRequestException('Role already exists.');

    if (permissions && permissions.length > 0) {
      const isValidPermissions = Utils.isValidPermission(permissions);
      if (!isValidPermissions.valid)
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
    history.action = ActionType.UPDATE;
    history.subject = SubjectType.ROLE;
    history.userId = loggedUser.id;
    history.subjectId = id;

    history.before = {
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    };

    role.permissions = dbPermissions;
    role.name = name;
    role.description = description;

    role = await this.dbSource.manager.save(role);
    history.after = {
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    };
    await this.dbSource.manager.save(history);

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      message: 'Role updated successfully.',
    };
  }

  async delete(param: DeleteRoleDto) {
    const { id } = param;
    const loggedUser: User = this.request['user'];
    const access = Utils.checkPermissions(loggedUser.permissions, [
      {
        subject: SubjectType.ROLE,
        action: ActionType.DELETE,
      },
    ]);
    if (!access)
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    const role = await this.dbSource.manager.findOne(Role, {
      where: { id, deleted: false },
    });
    if (!role) throw new BadRequestException('Role not found.');
    const history = new History();
    history.action = ActionType.DELETE;
    history.subject = SubjectType.ROLE;
    history.userId = loggedUser.id;
    history.subjectId = id;
    history.before = {
      id: role.id,
      name: role.name,
      deleted: role.deleted,
    };
    role.deleted = true;
    await this.dbSource.manager.save(role);

    history.after = {
      id: role.id,
      name: role.name,
      deleted: role.deleted,
    };
    await this.dbSource.manager.save(history);

    return {
      id: role.id,
      message: 'Role deleted successfully.',
    };
  }
}
