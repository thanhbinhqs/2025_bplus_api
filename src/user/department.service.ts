import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Department } from './entities/department.entity';
import { DataSource, In } from 'typeorm';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { Utils } from 'src/common/helpers/utils';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { User } from './entities/user.entity';
import { SubjectType } from 'src/common/enums/subject-type.enum';
import { ActionType } from 'src/common/enums/action.enum';
import { FindAllDepartmentDto } from './dto/find-all-department.dto';
import { FindOneDepartmentDto } from './dto/find-one-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { History } from 'src/history/entities/history.entity';
import { DeleteDepartmentDto } from './dto/delete-department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request,
    private readonly dbSource: DataSource,
  ) {}

  async create(body: CreateDepartmentDto) {
    const { name, description, parentId } = body;
    const loggedUser: User = this.request['user'] as User;
    const access = Utils.checkPermissions(loggedUser.permissions, [
      {
        subject: SubjectType.DEPARTMENT,
        action: ActionType.CREATE,
      },
    ]);
    if (!access) {
      throw new ForbiddenException(
        'You do not have permission to create a department',
      );
    }
    let department = await this.dbSource.manager.findOne(Department, {
      where: { name },
    });
    if (department) {
      throw new ForbiddenException('Department already exists');
    }
    department = new Department();
    department.name = name;
    department.description = description;
    if (parentId) {
      const parentDepartment = await this.dbSource.manager.findOne(Department, {
        where: { id: parentId, deleted: false },
      });
      if (!parentDepartment) {
        throw new ForbiddenException('Parent department does not exist');
      }
      department.parent = parentDepartment;
    }
    await this.dbSource.manager.save(department);
  }

  async findAll(query: FindAllDepartmentDto) {
    const { page = 1, limit = 50, search = '' } = query;
    const loggedUser: User = this.request['user'] as User;
    const access = Utils.checkPermissions(
      loggedUser.permissions,
      Object.values(ActionType).map((action) => {
        return {
          subject: SubjectType.DEPARTMENT,
          action: action,
        };
      }),
    );
    if (!access) {
      throw new ForbiddenException(
        'You do not have permission to view departments',
      );
    }
    const repository = this.dbSource.getRepository(Department);
    const queryBuilder = repository.createQueryBuilder('department');
    queryBuilder.where('department.deleted = false');
    if (search) {
      queryBuilder.andWhere('department.name LIKE :search', {
        search: `%${search}%`,
      });
    }
    queryBuilder.orderBy('department.name', 'ASC');
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);
    const [departments, total] = await queryBuilder.getManyAndCount();

    return {
      data: departments,
      total,
      page: page,
      limit: limit,
    };
  }

  async findOne(param: FindOneDepartmentDto) {
    const { id } = param;
    const loggedUser: User = this.request['user'] as User;
    const access = Utils.checkPermissions(
      loggedUser.permissions,
      Object.values(ActionType).map((action) => {
        return {
          subject: SubjectType.DEPARTMENT,
          action: action,
        };
      }),
    );
    if (!access) {
      throw new ForbiddenException(
        'You do not have permission to view this department',
      );
    }
    const department = await this.dbSource.manager.findOne(Department, {
      where: { id, deleted: false },
    });
    if (!department) {
      throw new ForbiddenException('Department does not exist');
    }
    return department;
  }

  async update(body: UpdateDepartmentDto) {
    const { id, name, description, parentId, chidren } = body;
    const loggedUser: User = this.request['user'] as User;
    const access = Utils.checkPermissions(loggedUser.permissions, [
      {
        subject: SubjectType.DEPARTMENT,
        action: ActionType.UPDATE,
      },
    ]);
    if (!access) {
      throw new ForbiddenException(
        'You do not have permission to update this department',
      );
    }
    const department = await this.dbSource.manager.findOne(Department, {
      where: { id, deleted: false },
    });

    if (!department) {
      throw new ForbiddenException('Department does not exist');
    }

    const existingDepartment = await this.dbSource.manager.findOne(Department, {
      where: { name, deleted: false },
    });
    if (existingDepartment && existingDepartment.id !== id) {
      throw new ForbiddenException('Department already exists');
    }

    const history = new History();
    history.action = ActionType.UPDATE;
    history.subject = SubjectType.DEPARTMENT;
    history.subjectId = id;
    history.userId = loggedUser.id;
    history.before = {
      name: department.name,
      description: department.description,
      parentId: department.parent ? department.parent.id : null,
      children: department.children.map((child) => child.id),
    };

    //check if parent department exists
    if (parentId) {
      const parentDepartment = await this.dbSource.manager.findOne(Department, {
        where: { id: parentId, deleted: false },
      });
      if (!parentDepartment) {
        throw new ForbiddenException('Parent department does not exist');
      }
      department.parent = parentDepartment;
    } else {
      department.parent = undefined;
    }

    //check if children departments exist
    if (chidren) {
      const childrenDepartments = await this.dbSource.manager.find(Department, {
        where: { id: In(chidren), deleted: false },
      });
      if (childrenDepartments.length !== chidren.length) {
        throw new ForbiddenException('Some children departments do not exist');
      }
      department.children = childrenDepartments;
    } else {
      department.children = [];
    }

    department.name = name;
    department.description = description;
    await this.dbSource.manager.save(department);
    history.after = {
      name: department.name,
      description: department.description,
      parentId: department.parent ? department.parent.id : null,
      children: department.children.map((child) => child.id),
    };
    await this.dbSource.manager.save(history);

    return {
      message: 'Department updated successfully',
      id: department.id,
      name: department.name,
      description: department.description,
    };
  }

  async delete(param: DeleteDepartmentDto) {
    const { id } = param;
    const loggedUser: User = this.request['user'] as User;
    const access = Utils.checkPermissions(loggedUser.permissions, [
      {
        subject: SubjectType.DEPARTMENT,
        action: ActionType.DELETE,
      },
    ]);
    if (!access) {
      throw new ForbiddenException(
        'You do not have permission to delete this department',
      );
    }
    const department = await this.dbSource.manager.findOne(Department, {
      where: { id, deleted: false },
    });
    if (!department) {
      throw new ForbiddenException('Department does not exist');
    }
    const history = new History();
    history.action = ActionType.DELETE;
    history.subject = SubjectType.DEPARTMENT;
    history.subjectId = id;
    history.userId = loggedUser.id;
    history.before = {
      id: department.id,
      name: department.name,
      deleted: department.deleted,
    };

    department.deleted = true;
    await this.dbSource.manager.save(department);

    history.after = {
      id: department.id,
      name: department.name,
      deleted: department.deleted,
    };
    await this.dbSource.manager.save(history);

    return {
      message: 'Department deleted successfully',
      id: department.id,
      name: department.name,
    };
  }
}
